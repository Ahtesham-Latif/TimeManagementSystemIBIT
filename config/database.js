import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DataTypes, QueryTypes, Sequelize } from 'sequelize';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.resolve(__dirname, '..', '..', 'db', 'TMS(IBIT).db'),
  logging: false,
  define: {
    freezeTableName: true
  }
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const withSqliteRetry = async (operation, { attempts = 5, delayMs = 250 } = {}) => {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const isBusy = String(error?.original?.code || error?.parent?.code || error?.name || '').includes('SQLITE_BUSY');

      if (!isBusy || attempt === attempts) {
        throw error;
      }

      await sleep(delayMs * attempt);
    }
  }

  throw lastError;
};

export const configureSqliteTimeout = async () => {
  await sequelize.query('PRAGMA busy_timeout = 5000');
};

export const repairScheduleTableSchema = async () => {
  const queryInterface = sequelize.getQueryInterface();
  const scheduleColumns = await queryInterface.describeTable('Schedule');
  const foreignKeys = await sequelize.query("PRAGMA foreign_key_list('Schedule')", {
    type: QueryTypes.SELECT
  });

  const hasLegacySectionId = Object.prototype.hasOwnProperty.call(scheduleColumns, 'section_id');
  const hasMissingSectionName = !Object.prototype.hasOwnProperty.call(scheduleColumns, 'section_name');
  const hasNonNullableSectionName = scheduleColumns.section_name?.allowNull === false;
  const hasInvalidSectionForeignKey = foreignKeys.some(
    (foreignKey) =>
      foreignKey.table === 'Section' &&
      foreignKey.from === 'section_id'
  );

  if (!hasLegacySectionId && !hasMissingSectionName && !hasNonNullableSectionName && !hasInvalidSectionForeignKey) {
    return;
  }

  const legacyTableName = 'Schedule__legacy_repair';
  const existingTables = await queryInterface.showAllTables();

  await sequelize.query('PRAGMA foreign_keys = OFF');

  try {
    if (existingTables.includes(legacyTableName)) {
      await queryInterface.dropTable(legacyTableName);
    }

    await queryInterface.renameTable('Schedule', legacyTableName);

    await queryInterface.createTable('Schedule', {
      schedule_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      day: {
        type: DataTypes.STRING,
        allowNull: false
      },
      slot_color: {
        type: DataTypes.STRING
      },
      batch_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Batch',
          key: 'batch_id'
        }
      },
      section_name: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
          model: 'Section',
          key: 'section_name'
        }
      },
      course_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Course',
          key: 'course_id'
        }
      },
      teacher_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Teacher',
          key: 'teacher_id'
        }
      },
      room_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Room',
          key: 'room_id'
        }
      },
      slot_table_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Slot',
          key: 'slot_table_id'
        }
      },
      spec_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Specialization',
          key: 'spec_id'
        }
      },
      audience_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Audience',
          key: 'audience_id'
        }
      }
    });

    await sequelize.query(`
      INSERT INTO "Schedule" (
        schedule_id,
        day,
        slot_color,
        batch_id,
        section_name,
        course_id,
        teacher_id,
        room_id,
        slot_table_id,
        spec_id,
        audience_id
      )
      SELECT
        schedule_id,
        day,
        slot_color,
        batch_id,
        section_name,
        course_id,
        teacher_id,
        room_id,
        slot_table_id,
        spec_id,
        audience_id
      FROM "${legacyTableName}"
    `);

    await queryInterface.dropTable(legacyTableName);
  } finally {
    await sequelize.query('PRAGMA foreign_keys = ON');
  }
};

export const renameAudienceSectionNamesColumn = async () => {
  const queryInterface = sequelize.getQueryInterface();
  const audienceColumns = await queryInterface.describeTable('Audience');
  const hasOldColumn = Object.prototype.hasOwnProperty.call(audienceColumns, 'section_ids');
  const hasNewColumn = Object.prototype.hasOwnProperty.call(audienceColumns, 'section_names');

  if (!hasOldColumn || hasNewColumn) {
    return;
  }

  await queryInterface.renameColumn('Audience', 'section_ids', 'section_names');
};

export const repairAudienceSectionSchema = async () => {
  const queryInterface = sequelize.getQueryInterface();
  let audienceSectionExists = true;

  try {
    await queryInterface.describeTable('AudienceSection');
  } catch (error) {
    audienceSectionExists = false;
  }

  if (!audienceSectionExists) {
    await queryInterface.createTable('AudienceSection', {
      audience_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'Audience',
          key: 'audience_id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      section_name: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'Section',
          key: 'section_name'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      }
    });
  }

  await queryInterface.describeTable('AudienceSection');

  const audienceRows = await sequelize.query('SELECT audience_id, section_names FROM "Audience"', {
    type: QueryTypes.SELECT
  });

  const linkRows = [];
  for (const row of audienceRows) {
    const sectionNames = String(row.section_names || '')
      .split('+')
      .map((item) => item.trim())
      .filter(Boolean);

    for (const sectionName of sectionNames) {
      linkRows.push({
        audience_id: row.audience_id,
        section_name: sectionName
      });
    }
  }

  if (linkRows.length > 0) {
    await withSqliteRetry(
      () => queryInterface.bulkInsert('AudienceSection', linkRows, {
        ignoreDuplicates: true
      }),
      { attempts: 6, delayMs: 300 }
    ).catch((error) => {
      if (String(error?.original?.code || error?.parent?.code || '').includes('SQLITE_BUSY')) {
        console.warn('AudienceSection backfill skipped for now because the database is locked. It will be retried on the next restart.');
        return;
      }

      throw error;
    });
  }
};

export const renameTeacherDepartmentColumn = async () => {
  const queryInterface = sequelize.getQueryInterface();
  const teacherColumns = await queryInterface.describeTable('Teacher');
  const hasOldColumn = Object.prototype.hasOwnProperty.call(teacherColumns, 'department');
  const hasNewColumn = Object.prototype.hasOwnProperty.call(teacherColumns, 'courses');

  if (!hasOldColumn || hasNewColumn) {
    return;
  }

  await queryInterface.renameColumn('Teacher', 'department', 'courses');
};

export default sequelize;
