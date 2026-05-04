import Batch from './Batch.js';
import Section from './Section.js';
import Schedule from './Schedule.js';
import Course from './Course.js';
import Teacher from './Teacher.js';
import Room from './Room.js';
import Slot from './Slot.js';
import Specialization from './Specialization.js';
import Audience from './Audience.js';
import AudienceSection from './AudienceSection.js';
import Admin from './Admin.js';
import Communication from './Communication.js';

// Schedule Master Connectors [cite: 16, 17]
Schedule.belongsTo(Batch, { foreignKey: 'batch_id', onDelete: 'SET NULL' });
Schedule.belongsTo(Section, {
  foreignKey: 'section_name',
  targetKey: 'section_name',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});
Section.hasMany(Schedule, {
  foreignKey: 'section_name',
  sourceKey: 'section_name',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});
Schedule.belongsTo(Course, { foreignKey: 'course_id', onDelete: 'SET NULL' });
Schedule.belongsTo(Teacher, { foreignKey: 'teacher_id', onDelete: 'SET NULL' });
Schedule.belongsTo(Room, { foreignKey: 'room_id', onDelete: 'SET NULL' });
Schedule.belongsTo(Slot, { foreignKey: 'slot_table_id', onDelete: 'SET NULL' });
Schedule.belongsTo(Specialization, { foreignKey: 'spec_id', onDelete: 'SET NULL' });
Schedule.belongsTo(Audience, { foreignKey: 'audience_id', onDelete: 'SET NULL' });
Audience.belongsToMany(Section, {
  through: AudienceSection,
  foreignKey: 'audience_id',
  otherKey: 'section_name',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Section.belongsToMany(Audience, {
  through: AudienceSection,
  foreignKey: 'section_name',
  otherKey: 'audience_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

export { Batch, Section, Schedule, Course, Teacher, Room, Slot, Specialization, Audience, AudienceSection, Admin, Communication };
