import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sequelize, { configureSqliteTimeout, renameAudienceSectionNamesColumn, repairScheduleTableSchema, repairAudienceSectionSchema, renameTeacherDepartmentColumn } from './config/database.js';
import BatchRoute from './routes/BatchRoute.js';
import CourseRoute from './routes/CourseRoute.js';
import TeacherRoute from './routes/TeacherRoute.js';
import SectionRoute from './routes/SectionsRoute.js';
import RoomRoute from './routes/RoomRoute.js';
import SlotRoute from './routes/SlotRoute.js';
import SpecializationRoute from './routes/SpecializationRoute.js';
import AudienceRoute from './routes/AudienceRoute.js';
import AdminRoute from './routes/AdminRoute.js';
import CommunicationRoute from './routes/CommunicationRoute.js';
import ScheduleRoute from './routes/ScheduleRoute.js';

// 1. Initialize the app FIRST
const app = express(); 

// 2. Middleware comes SECOND
app.use(express.json()); 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get('/', (req, res) => {
res.send('<h1 style = "color: red; text-align: center; background-color: green;">Hello, From JS using Express Framework!</h1>');
});

app.get('/panel', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

app.get('/teacher', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

// 3. Routes come THIRD
app.use('/api/batches', BatchRoute);
app.use('/api/courses', CourseRoute);
app.use('/api/teachers', TeacherRoute);
app.use('/api/sections', SectionRoute);
app.use('/api/rooms', RoomRoute);
app.use('/api/slots', SlotRoute);
app.use('/api/specializations', SpecializationRoute);
app.use('/api/audiences', AudienceRoute);
app.use('/api/admins', AdminRoute);
app.use('/api/communications', CommunicationRoute);
app.use('/api/schedules', ScheduleRoute);

const PORT = 5000;

// 4. Start the server LAST
// server.js
const safeRepair = async (label, operation) => {
  try {
    await operation();
  } catch (error) {
    const code = String(error?.original?.code || error?.parent?.code || error?.code || '');
    if (code.includes('SQLITE_READONLY') || code.includes('SQLITE_BUSY')) {
      console.warn(`${label} skipped: ${code}`);
      return;
    }

    throw error;
  }
};

sequelize.sync({ alter: false }) // 'alter' updates the table if columns change
  .then(() => configureSqliteTimeout())
  .then(() => safeRepair('Schedule schema repair', repairScheduleTableSchema))
  .then(() => safeRepair('Audience column rename', renameAudienceSectionNamesColumn))
  .then(() => safeRepair('AudienceSection repair', repairAudienceSectionSchema))
  .then(() => safeRepair('Teacher column rename', renameTeacherDepartmentColumn))
  .then(() => {
    console.log('Database synced & Connected to TMS(IBIT).db');
    app.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch(err => console.error('Database sync failed:', err));
