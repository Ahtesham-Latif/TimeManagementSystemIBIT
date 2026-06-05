import request from 'supertest';
import app from '../server.js'; // Ensure your express app is exported from server.js
import { Admin, Teacher } from '../models/index.js';
import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';

describe('Authentication & Security', () => {
  const testAdmin = {
    admin_name: 'Admin',
    email: 'admin@ibit.com',
    password: 'admin123',
    permissions_level: 'super'
  };

  beforeAll(async () => {
    await sequelize.sync();
    await Admin.destroy({ where: { email: testAdmin.email } });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('POST /api/admins should hash password and not return it', async () => {
    const res = await request(app)
      .post('/api/admins')
      .send(testAdmin);

    expect(res.status).toBe(201);
    expect(res.body.data).not.toHaveProperty('password');
    
    const savedAdmin = await Admin.findOne({ where: { email: testAdmin.email } });
    expect(savedAdmin.password).not.toBe(testAdmin.password);
    const isMatch = await bcrypt.compare(testAdmin.password, savedAdmin.password);
    expect(isMatch).toBe(true);
  });

  test('POST /api/admins/login should return 200 and strip password', async () => {
    const res = await request(app)
      .post('/api/admins/login')
      .send({
        email: testAdmin.email,
        password: testAdmin.password
      });

    expect(res.status).toBe(200);
    expect(res.body.data).not.toHaveProperty('password');
    expect(res.body.message).toBe('Login successful');
  });

  test('Login should be case-insensitive for email', async () => {
    const res = await request(app)
      .post('/api/admins/login')
      .send({
        email: 'ADMIN@ibit.com',
        password: testAdmin.password
      });
    expect(res.status).toBe(200);
  });

  test('Login should fail with wrong password', async () => {
    const res = await request(app)
      .post('/api/admins/login')
      .send({ email: testAdmin.email, password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });
});