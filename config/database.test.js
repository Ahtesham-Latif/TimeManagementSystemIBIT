import sequelize from '../config/database.js';
import { repairAdminTableSchema } from '../config/database.js';

describe('Database Resilience', () => {
  afterAll(async () => {
    await sequelize.close();
  });

  test('Repair logic should handle legacy integer IDs', async () => {
    // This is a simulation test
    // 1. Manually drop and create a legacy Admin table with INT id
    await sequelize.query('DROP TABLE IF EXISTS Admin');
    await sequelize.query('CREATE TABLE Admin (admin_id INTEGER PRIMARY KEY, admin_name TEXT, email TEXT, password TEXT, permissions_level TEXT)');
    await sequelize.query('INSERT INTO Admin (admin_id, admin_name, email, password, permissions_level) VALUES (1, "Legacy", "l@i.com", "hash", "super")');

    // 2. Run repair
    await repairAdminTableSchema();

    // 3. Verify ID is now ADM001 (String)
    const [results] = await sequelize.query('SELECT admin_id FROM Admin WHERE admin_name = "Legacy"');
    expect(results[0].admin_id).toBe('ADM001');
    
    // 4. Check schema
    const columns = await sequelize.getQueryInterface().describeTable('Admin');
    expect(columns.admin_id.type).toContain('VARCHAR');
  });
});