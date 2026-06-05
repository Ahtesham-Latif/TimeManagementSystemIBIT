import request from 'supertest';
import app from '../server.js';
import { Schedule, Audience, Teacher, Room, Batch, Slot, Section, Course, Specialization } from '../models/index.js';
import sequelize from '../config/database.js';

describe('Schedule Conflict Detection', () => {
  beforeAll(async () => {
    await sequelize.sync();
    
    // Seed prerequisite data for in-memory database
    await Batch.create({ batch_id: 1, batch_name: 'Test Batch' });
    await Section.create({ section_name: 'A' });
    await Section.create({ section_name: 'B' });
    await Teacher.create({ teacher_id: 1, teacher_name: 'T1', email: 't1@test.com', password: 'hash' });
    await Teacher.create({ teacher_id: 2, teacher_name: 'T2', email: 't2@test.com', password: 'hash' });
    await Teacher.create({ teacher_id: 5, teacher_name: 'T5', email: 't5@test.com', password: 'hash' });
    await Room.create({ room_id: 1, room_name: 'R1' });
    await Room.create({ room_id: 2, room_name: 'R2' });
    await Room.create({ room_id: 5, room_name: 'R5' });
    await Slot.create({ 
      slot_table_id: 1, 
      slot_name: 'S1',
      start_time: '08:00',
      end_time: '09:00'
    });
    await Specialization.create({ spec_id: 1, spec_name: 'General' });
    await Specialization.create({ spec_id: 2, spec_name: 'IT' });
    await Course.create({ course_id: 1, course_code: 'CS101', course_name: 'Intro' });
    await Course.create({ course_id: 2, course_code: 'GEN101', course_name: 'Gen Ed' });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  const baseSchedule = {
    day: 'Monday',
    slot_table_id: 1,
    batch_id: 1,
    course_code: 'CS101',
    teacher_id: 1,
    room_id: 1,
    spec_id: 1,
    section_name: 'A'
  };

  beforeEach(async () => {
    await Schedule.destroy({ where: {} });
  });

  test('Should prevent same Teacher in same Slot/Day', async () => {
    // Create first class
    await request(app).post('/api/schedules').send(baseSchedule);

    // Attempt second class for same teacher but different room/section
    const res = await request(app).post('/api/schedules').send({
      ...baseSchedule,
      room_id: 2,
      section_name: 'B'
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain('Teacher is already booked');
  });

  test('Should prevent same Room in same Slot/Day', async () => {
    await request(app).post('/api/schedules').send(baseSchedule);

    const res = await request(app).post('/api/schedules').send({
      ...baseSchedule,
      teacher_id: 2,
      section_name: 'B'
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain('Room is already booked');
  });

  test('Should allow different Specializations in same Section/Slot', async () => {
    await request(app).post('/api/schedules').send(baseSchedule); // Spec 1

    const res = await request(app).post('/api/schedules').send({
      ...baseSchedule,
      teacher_id: 2,
      room_id: 2,
      spec_id: 2 // Different Spec
    });

    expect(res.status).toBe(201);
  });

  test('Should detect conflict between Section and Audience overlap', async () => {
    // 1. Create an Audience "A+B" that includes Section A
    const audience = await Audience.create({
      audience_label: 'A+B',
      section_names: 'A+B'
    });

    // 2. Book Section A for Monday Slot 1
    await request(app).post('/api/schedules').send(baseSchedule);

    // 3. Attempt to book Audience "A+B" for Monday Slot 1
    const res = await request(app).post('/api/schedules').send({
      day: 'Monday',
      slot_table_id: 1,
      batch_id: 1,
      course_code: 'GEN101',
      teacher_id: 5,
      room_id: 5,
      spec_id: 1,
      audience_label: 'A+B'
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain('already booked');
  });
});