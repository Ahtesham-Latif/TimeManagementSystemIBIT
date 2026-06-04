import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ADMIN_ID_PREFIX = 'ADM';
const ADMIN_ID_WIDTH = 3;

const formatAdminId = (value) => {
  const normalized = String(value ?? '').trim().toUpperCase();
  const match = normalized.match(/^(?:ADM)?(\d+)$/);

  if (!match) {
    return normalized;
  }

  return `${ADMIN_ID_PREFIX}${match[1].padStart(ADMIN_ID_WIDTH, '0')}`;
};

const buildNextAdminId = async () => {
  const admins = await Admin.findAll({
    attributes: ['admin_id'],
    raw: true
  });

  let maxId = 0;

  for (const row of admins) {
    const normalized = formatAdminId(row.admin_id);
    const match = normalized.match(/^ADM(\d+)$/);

    if (match) {
      maxId = Math.max(maxId, Number(match[1]));
    }
  }

  return `${ADMIN_ID_PREFIX}${String(maxId + 1).padStart(ADMIN_ID_WIDTH, '0')}`;
};

const Admin = sequelize.define('Admin', {
  admin_id: { type: DataTypes.STRING, primaryKey: true },
  admin_name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  permissions_level: { type: DataTypes.STRING }
}, { tableName: 'Admin', timestamps: false });

Admin.beforeValidate(async (admin) => {
  if (!admin.admin_id) {
    admin.admin_id = await buildNextAdminId();
    return;
  }

  admin.admin_id = formatAdminId(admin.admin_id);
});

export default Admin;
