import { Op } from 'sequelize';
import {
  Schedule,
  Section,
  Audience,
  Batch,
  Course,
  Teacher,
  Room,
  Slot,
  Specialization,
  Communication
} from '../models/index.js';

const scheduleIncludes = [
  { model: Batch },
  { model: Section },
  { model: Course },
  { model: Teacher },
  { model: Room },
  { model: Slot },
  { model: Specialization },
  { model: Audience }
];

const dayOrder = new Map([
  ['Monday', 1],
  ['Tuesday', 2],
  ['Wednesday', 3],
  ['Thursday', 4],
  ['Friday', 5],
  ['Saturday', 6],
  ['Sunday', 7]
]);

const toPlain = (record) => (record && typeof record.toJSON === 'function' ? record.toJSON() : record);

const attachCourseCode = (schedule) => {
  const plain = toPlain(schedule);
  if (plain.Course && plain.Course.course_code) {
    plain.course_code = plain.Course.course_code;
  }
  if (plain.Batch && plain.Batch.batch_name) {
    plain.batch_name = plain.Batch.batch_name;
  }
  if (plain.Room && plain.Room.room_name) {
    plain.room_name = plain.Room.room_name;
  }
  if (plain.Slot && plain.Slot.slot_name) {
    plain.slot_name = plain.Slot.slot_name;
  }
  if (plain.Specialization) {
    plain.spec_name = plain.Specialization.spec_name;
    plain.spec_color = plain.Specialization.spec_color;
  }
  if (plain.Audience && plain.Audience.audience_label) {
    plain.audience_label = plain.Audience.audience_label;
    plain.audience_name = plain.Audience.audience_label;
  }
  return plain;
};

const resolveCourseByCode = async (courseCode) => {
  if (!courseCode) {
    return null;
  }

  return Course.findOne({
    where: {
      course_code: courseCode
    }
  });
};

const resolveByIdOrName = async (model, options) => {
  const { idField, idValue, nameField, nameValue } = options;

  if (nameValue !== undefined && nameValue !== null && String(nameValue).trim() !== '') {
    return model.findOne({
      where: {
        [nameField]: String(nameValue).trim()
      }
    });
  }

  if (idValue !== undefined && idValue !== null && idValue !== '') {
    return model.findByPk(idValue);
  }

  return null;
};

const resolveBatchByNameOrId = (batchId, batchName) =>
  resolveByIdOrName(Batch, {
    idField: 'batch_id',
    idValue: batchId,
    nameField: 'batch_name',
    nameValue: batchName
  });

const resolveRoomByNameOrId = (roomId, roomName) =>
  resolveByIdOrName(Room, {
    idField: 'room_id',
    idValue: roomId,
    nameField: 'room_name',
    nameValue: roomName
  });

const resolveSlotByNameOrId = (slotId, slotName) =>
  resolveByIdOrName(Slot, {
    idField: 'slot_table_id',
    idValue: slotId,
    nameField: 'slot_name',
    nameValue: slotName
  });

const resolveSpecByNameOrId = (specId, specName) =>
  resolveByIdOrName(Specialization, {
    idField: 'spec_id',
    idValue: specId,
    nameField: 'spec_name',
    nameValue: specName
  });

const resolveAudienceByNameOrId = (audienceId, audienceLabel) =>
  resolveByIdOrName(Audience, {
    idField: 'audience_id',
    idValue: audienceId,
    nameField: 'audience_label',
    nameValue: audienceLabel
  });

const resolveTeacherById = async (teacherId) => {
  if (teacherId === undefined || teacherId === null || teacherId === '') {
    return null;
  }

  return Teacher.findByPk(teacherId);
};

const resolveSectionsFromSchedule = (schedule) => {
  if (!schedule) {
    return [];
  }

  if (schedule.section_name) {
    return [schedule.section_name];
  }

  const audienceSections = schedule.Audience?.section_names || '';
  return parseSectionNames(audienceSections);
};

const resolveSectionsFromRequest = async ({ section_name, audience_id, audience_label }) => {
  if (section_name) {
    return [section_name];
  }

  if (audience_id || audience_label) {
    const audience = await Audience.findOne({
      where: audience_id !== undefined && audience_id !== null && audience_id !== ''
        ? { audience_id }
        : { audience_label }
    });
    if (!audience) {
      return null;
    }

    return parseSectionNames(audience.section_names);
  }

  return [];
};

const hasSectionOverlap = (leftSections, rightSections) => {
  const rightSet = new Set(rightSections);
  return leftSections.some((sectionName) => rightSet.has(sectionName));
};

const findScheduleConflicts = async ({
  batch_id,
  day,
  slot_table_id,
  teacher_id,
  section_name,
  audience_id,
  audience_label,
  excludeScheduleId
}) => {
  const requestSections = await resolveSectionsFromRequest({ section_name, audience_id, audience_label });
  if (requestSections === null) {
    return { error: 'Audience not found' };
  }

  const whereBase = {
    day,
    slot_table_id
  };
  const cancelledScheduleIds = await getCancelledScheduleIds();

  if (excludeScheduleId !== undefined && excludeScheduleId !== null) {
    whereBase.schedule_id = {
      [Op.ne]: excludeScheduleId
    };
  }

  if (teacher_id !== undefined && teacher_id !== null && teacher_id !== '') {
    const teacherConflict = await Schedule.findOne({
      where: {
        ...whereBase,
        teacher_id
      }
    });

    if (teacherConflict && !cancelledScheduleIds.has(Number(teacherConflict.schedule_id))) {
      return {
        error: 'Teacher is already booked for this day and slot',
        conflict: teacherConflict
      };
    }
  }

  if (!batch_id) {
    return { requestSections };
  }

  const sectionConflictRows = await Schedule.findAll({
    where: {
      ...whereBase,
      batch_id
    },
    include: [{ model: Audience }]
  });

  const conflict = sectionConflictRows.find((schedule) => {
    if (cancelledScheduleIds.has(Number(schedule.schedule_id))) {
      return false;
    }
    const existingSections = resolveSectionsFromSchedule(schedule);
    return hasSectionOverlap(requestSections, existingSections);
  });

  if (conflict) {
    return {
      error: 'This class or audience group is already booked for this day and slot',
      conflict
    };
  }

  return { requestSections };
};

const parseSectionNames = (value) => {
  if (!value) {
    return [];
  }

  return String(value)
    .split('+')
    .map((item) => item.trim())
    .filter(Boolean);
};

const normalizeIdList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (value === undefined || value === null || value === '') {
    return [];
  }

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const sortSchedules = (records) => {
  return [...records].sort((left, right) => {
    const leftDay = dayOrder.get(left.day) ?? 99;
    const rightDay = dayOrder.get(right.day) ?? 99;

    if (leftDay !== rightDay) {
      return leftDay - rightDay;
    }

    const leftSlot = Number(left.slot_table_id ?? 0);
    const rightSlot = Number(right.slot_table_id ?? 0);

    if (leftSlot !== rightSlot) {
      return leftSlot - rightSlot;
    }

    return Number(left.schedule_id ?? 0) - Number(right.schedule_id ?? 0);
  });
};

const parseCommunicationContent = (content) => {
  if (!content) {
    return null;
  }

  if (typeof content === 'object') {
    return content;
  }

  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
};

const getCancelledScheduleIds = async () => {
  const communications = await Communication.findAll({
    where: {
      msg_type: 'Slot Cancelled',
      status: 'Done'
    },
    attributes: ['content']
  });

  const ids = new Set();
  for (const communication of communications) {
    const payload = parseCommunicationContent(communication.content);
    if (payload?.schedule_id !== undefined && payload?.schedule_id !== null) {
      ids.add(Number(payload.schedule_id));
    }
  }

  return ids;
};

const resolveStudentSchedules = async (batchId, sectionName, specId = null) => {
  const directWhere = {
    batch_id: batchId,
    section_name: sectionName
  };

  const audienceRows = await Audience.findAll({
    where: {
      section_names: {
        [Op.like]: `%${sectionName}%`
      }
    }
  });

  const audienceIds = [...new Set(audienceRows
    .filter((audience) => parseSectionNames(audience.section_names).includes(sectionName))
    .map((audience) => Number(audience.audience_id)))];

  const audienceWhere = {
    batch_id: batchId
  };

  if (audienceIds.length) {
    audienceWhere.audience_id = {
      [Op.in]: audienceIds
    };
  } else {
    audienceWhere.audience_id = null;
  }

  if (specId !== null && specId !== undefined && specId !== '') {
    directWhere.spec_id = specId;
    audienceWhere.spec_id = specId;
  }

  const [directSchedules, audienceSchedules, audiences] = await Promise.all([
    Schedule.findAll({
      where: directWhere,
      include: scheduleIncludes
    }),
    audienceIds.length
      ? Schedule.findAll({
          where: audienceWhere,
          include: scheduleIncludes
        })
      : Promise.resolve([]),
    audienceIds.length
      ? Audience.findAll({
          where: {
            audience_id: {
              [Op.in]: audienceIds
            }
          }
        })
      : Promise.resolve([])
  ]);

  const cancelledScheduleIds = await getCancelledScheduleIds();
  const audienceLookup = new Map(audiences.map((audience) => [Number(audience.audience_id), toPlain(audience)]));

  const resolved = new Map();

  for (const record of directSchedules) {
    const plain = attachCourseCode(record);
    if (cancelledScheduleIds.has(Number(plain.schedule_id))) {
      continue;
    }
    plain.view_scope = 'section';
    plain.resolved_section_name = sectionName;
    resolved.set(plain.schedule_id, plain);
  }

  for (const record of audienceSchedules) {
    const plain = attachCourseCode(record);
    if (cancelledScheduleIds.has(Number(plain.schedule_id))) {
      continue;
    }
    const audienceId = Number(plain.audience_id);
    plain.view_scope = 'audience';
    plain.resolved_section_name = sectionName;
    plain.audience_sections = parseSectionNames(plain.Audience?.section_names || '');
    plain.audience = audienceLookup.get(audienceId) || null;
    resolved.set(plain.schedule_id, plain);
  }

  return sortSchedules([...resolved.values()]);
};

export const createSchedule = async (req, res) => {
  try {
    const {
      day,
      slot_color,
      batch_id,
      batch_name,
      section_name,
      audience_id,
      audience_label,
      audience_name,
      course_code,
      teacher_id,
      room_id,
      room_name,
      slot_table_id,
      slot_name,
      spec_id,
      spec_name
    } = req.body;

    if (!day) {
      return res.status(400).json({ message: "day is required" });
    }

    if (!teacher_id) {
      return res.status(400).json({ message: "teacher_id is required" });
    }

    if (!course_code) {
      return res.status(400).json({ message: "course_code is required" });
    }

    const course = await resolveCourseByCode(course_code);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const batch = await resolveBatchByNameOrId(batch_id, batch_name);
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    const specialization = await resolveSpecByNameOrId(spec_id, spec_name);
    if (!specialization) {
      return res.status(404).json({ message: "Specialization not found" });
    }

    const room = await resolveRoomByNameOrId(room_id, room_name);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const slot = await resolveSlotByNameOrId(slot_table_id, slot_name);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    const teacher = await resolveTeacherById(teacher_id);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const audience = await resolveAudienceByNameOrId(audience_id, audience_label ?? audience_name);
    const finalSectionName = section_name ?? null;
    const finalAudienceId = audience ? audience.audience_id : null;

    if (!finalSectionName && !finalAudienceId) {
      return res.status(400).json({ message: "Either section_name or audience name is required" });
    }

    if (finalSectionName && finalAudienceId) {
      return res.status(400).json({ message: "Use either section_name or audience name/id, not both" });
    }

    if (finalSectionName) {
      const section = await Section.findByPk(finalSectionName);
      if (!section) {
        return res.status(404).json({ message: "Section not found" });
      }
    }

    const conflictCheck = await findScheduleConflicts({
      batch_id: batch.batch_id,
      day,
      slot_table_id: slot.slot_table_id,
      teacher_id: teacher.teacher_id,
      section_name: finalSectionName,
      audience_id: finalAudienceId,
      audience_label: audience_label ?? audience_name
    });

    if (conflictCheck.error) {
      return res.status(409).json({
        message: conflictCheck.error
      });
    }

    const newSchedule = await Schedule.create({
      day,
      slot_color,
      batch_id: batch.batch_id,
      section_name: finalSectionName,
      audience_id: finalAudienceId,
      course_id: course.course_id,
      teacher_id: teacher.teacher_id,
      room_id: room.room_id,
      slot_table_id: slot.slot_table_id,
      spec_id: specialization.spec_id
    });

    res.status(201).json({
      message: "Schedule created successfully",
      data: {
        ...toPlain(newSchedule),
        course_code: course.course_code
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating schedule", error: error.message });
  }
};

export const getAllSchedules = async (req, res) => {
  try {
    const { batch_id, batch_name, section_name, spec_id, spec_name, teacher_id } = req.query;

  if (teacher_id !== undefined && teacher_id !== null && teacher_id !== '') {
      const schedules = await Schedule.findAll({
        where: {
          teacher_id
        },
        include: scheduleIncludes
      });
      const cancelledScheduleIds = await getCancelledScheduleIds();
      const activeSchedules = schedules.filter((schedule) => !cancelledScheduleIds.has(Number(schedule.schedule_id)));

      return res.status(200).json({
        message: "Schedules retrieved successfully",
        data: sortSchedules(activeSchedules.map(attachCourseCode))
      });
    }

    if (batch_id !== undefined || batch_name !== undefined || section_name !== undefined || spec_id !== undefined || spec_name !== undefined) {
      if ((!batch_id && !batch_name) || !section_name) {
        return res.status(400).json({
          message: "batch_name and section_name are required when filtering schedules"
        });
      }

      const batch = await resolveBatchByNameOrId(batch_id, batch_name);
      if (!batch) {
        return res.status(404).json({ message: "Batch not found" });
      }

      const specialization = await resolveSpecByNameOrId(spec_id, spec_name);
      const schedules = await resolveStudentSchedules(batch.batch_id, section_name, specialization?.spec_id ?? null);
      return res.status(200).json({
        message: "Schedules retrieved successfully",
        data: schedules
      });
    }

    const schedules = await Schedule.findAll({
      include: scheduleIncludes
    });
    const cancelledScheduleIds = await getCancelledScheduleIds();
    const activeSchedules = schedules.filter((schedule) => !cancelledScheduleIds.has(Number(schedule.schedule_id)));

    res.status(200).json({
      message: "Schedules retrieved successfully",
      data: sortSchedules(activeSchedules.map(attachCourseCode))
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving schedules", error: error.message });
  }
};

export const getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await Schedule.findByPk(id, {
      include: scheduleIncludes
    });

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    res.status(200).json({
      message: "Schedule retrieved successfully",
      data: attachCourseCode(schedule)
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving schedule", error: error.message });
  }
};

export const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const hasSectionName = Object.prototype.hasOwnProperty.call(req.body, 'section_name');
    const hasAudienceId = Object.prototype.hasOwnProperty.call(req.body, 'audience_id');
    const {
      day,
      slot_color,
      batch_id,
      batch_name,
      section_name,
      audience_id,
      audience_label,
      audience_name,
      course_code,
      teacher_id,
      room_id,
      room_name,
      slot_table_id,
      slot_name,
      spec_id,
      spec_name
    } = req.body;

    const schedule = await Schedule.findByPk(id);

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    const hasAudienceSelection = hasAudienceId || audience_label !== undefined || audience_name !== undefined;

    if (hasSectionName && hasAudienceSelection) {
      return res.status(400).json({ message: "Use either section_name or audience name/id, not both" });
    }

    const updates = {};

    const nextDay = day !== undefined ? day : schedule.day;
    const nextSlotColor = slot_color !== undefined ? slot_color : schedule.slot_color;
    const nextCourse = course_code !== undefined ? await resolveCourseByCode(course_code) : null;
    if (course_code !== undefined && !nextCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    const nextBatch = (batch_id !== undefined || batch_name !== undefined)
      ? await resolveBatchByNameOrId(batch_id, batch_name)
      : null;
    if ((batch_id !== undefined || batch_name !== undefined) && !nextBatch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    const nextSpec = (spec_id !== undefined || spec_name !== undefined)
      ? await resolveSpecByNameOrId(spec_id, spec_name)
      : null;
    if ((spec_id !== undefined || spec_name !== undefined) && !nextSpec) {
      return res.status(404).json({ message: "Specialization not found" });
    }

    const nextRoom = (room_id !== undefined || room_name !== undefined)
      ? await resolveRoomByNameOrId(room_id, room_name)
      : null;
    if ((room_id !== undefined || room_name !== undefined) && !nextRoom) {
      return res.status(404).json({ message: "Room not found" });
    }

    const nextSlot = (slot_table_id !== undefined || slot_name !== undefined)
      ? await resolveSlotByNameOrId(slot_table_id, slot_name)
      : null;
    if ((slot_table_id !== undefined || slot_name !== undefined) && !nextSlot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    const nextTeacher = teacher_id !== undefined ? await resolveTeacherById(teacher_id) : null;
    if (teacher_id !== undefined && !nextTeacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const nextAudience = (audience_id !== undefined || audience_label !== undefined || audience_name !== undefined)
      ? await resolveAudienceByNameOrId(audience_id, audience_label ?? audience_name)
      : null;
    if ((audience_id !== undefined || audience_label !== undefined || audience_name !== undefined) && !nextAudience) {
      return res.status(404).json({ message: "Audience not found" });
    }

    let nextSectionName = schedule.section_name;
    let nextAudienceId = schedule.audience_id;

    if (hasSectionName) {
      if (!section_name) {
        return res.status(400).json({ message: "section_name cannot be empty" });
      }

      const section = await Section.findByPk(section_name);
      if (!section) {
        return res.status(404).json({ message: "Section not found" });
      }

      nextSectionName = section_name;
      nextAudienceId = null;
      updates.section_name = section_name;
      updates.audience_id = null;
    }

    if (hasAudienceSelection) {
      nextAudienceId = nextAudience?.audience_id ?? null;
      if (!nextAudienceId) {
        return res.status(400).json({ message: "audience name or id cannot be empty" });
      }

      nextSectionName = null;
      updates.audience_id = nextAudienceId;
      updates.section_name = null;
    }

    if (day !== undefined) {
      updates.day = nextDay;
    }

    if (slot_color !== undefined) {
      updates.slot_color = nextSlotColor;
    }

    if (batch_id !== undefined || batch_name !== undefined) {
      updates.batch_id = nextBatch.batch_id;
    }

    if (course_code !== undefined) {
      updates.course_id = nextCourse.course_id;
    }

    if (teacher_id !== undefined) {
      updates.teacher_id = nextTeacher.teacher_id;
    }

    if (room_id !== undefined || room_name !== undefined) {
      updates.room_id = nextRoom.room_id;
    }

    if (slot_table_id !== undefined || slot_name !== undefined) {
      updates.slot_table_id = nextSlot.slot_table_id;
    }

    if (spec_id !== undefined || spec_name !== undefined) {
      updates.spec_id = nextSpec.spec_id;
    }

    const nextBatchId = nextBatch ? nextBatch.batch_id : schedule.batch_id;
    const nextSlotTableId = nextSlot ? nextSlot.slot_table_id : schedule.slot_table_id;
    const nextTeacherId = nextTeacher ? nextTeacher.teacher_id : schedule.teacher_id;

    const conflictCheck = await findScheduleConflicts({
      batch_id: nextBatchId,
      day: nextDay,
      slot_table_id: nextSlotTableId,
      teacher_id: nextTeacherId,
      section_name: nextSectionName,
      audience_id: nextAudienceId,
      excludeScheduleId: schedule.schedule_id
    });

    if (conflictCheck.error) {
      return res.status(409).json({
        message: conflictCheck.error
      });
    }

    await schedule.update(updates);

    const updatedSchedule = await Schedule.findByPk(id, {
      include: scheduleIncludes
    });

    res.status(200).json({
      message: "Schedule updated successfully",
      data: attachCourseCode(updatedSchedule)
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating schedule", error: error.message });
  }
};

export const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await Schedule.findByPk(id);

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    await schedule.destroy();

    res.status(200).json({
      message: "Schedule deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting schedule", error: error.message });
  }
};
