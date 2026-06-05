import request from 'supertest';
import app from '../server.js';
import { Section, Schedule, Audience, Batch, Slot, AudienceSection } from '../models/index.js';
import sequelize from '../config/database.js';

describe('Section Update Cascading', () => {
  beforeAll(async () => {
    await sequelize.sync();
    await Batch.create({ batch_id: 1, batch_name: 'Test Batch' });
    await Slot.create({ 
      slot_table_id: 1, 
      slot_name: 'S1',
      start_time: '08:00',
      end_time: '09:00'
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('Updating section name should cascade to Schedules and Audiences', async () => {
    // Setup
    await Section.create({ section_name: 'OldName' });
    const audience = await Audience.create({ audience_label: 'Joint', section_names: 'OldName+B' });
    await AudienceSection.create({ audience_id: audience.audience_id, section_name: 'OldName' });
    
    // Create a schedule for OldName
    const sched = await Schedule.create({
      day: 'Monday',
      batch_id: 1,
      section_name: 'OldName',
      slot_table_id: 1
    });

    // Execute Rename
    const res = await request(app)
      .put('/api/sections/OldName')
      .send({ section_name: 'NewName' });

    expect(res.status).toBe(200);

    // Verify Schedule updated
    const updatedSched = await Schedule.findByPk(sched.schedule_id);
    expect(updatedSched.section_name).toBe('NewName');

    // Verify Audience updated
    const updatedAudience = await Audience.findOne({ where: { audience_label: 'Joint' } });
    expect(updatedAudience.section_names).toBe('NewName+B');
    
    // Verify Old Section is gone
    const oldSec = await Section.findByPk('OldName');
    expect(oldSec).toBeNull();
  });
});