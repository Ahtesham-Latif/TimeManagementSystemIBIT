import { Audience, AudienceSection, Section } from '../models/index.js';

const splitSectionNames = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (value === undefined || value === null) {
    return [];
  }

  return String(value)
    .split('+')
    .map((item) => item.trim())
    .filter(Boolean);
};

const normalizeSectionNames = (value) => {
  const sections = splitSectionNames(value);
  return sections.length ? sections.join('+') : undefined;
};

const syncAudienceSections = async (audienceId, sectionNames, transaction) => {
  await AudienceSection.destroy({
    where: { audience_id: audienceId },
    transaction
  });

  if (!sectionNames.length) {
    return;
  }

  await AudienceSection.bulkCreate(
    sectionNames.map((sectionName) => ({
      audience_id: audienceId,
      section_name: sectionName
    })),
    { transaction }
  );
};

export const createAudience = async (req, res) => {
  try {
    const { audience_label, audience_name, section_names, section_ids, sections, is_compulsory } = req.body;
    const finalAudienceLabel = audience_label ?? audience_name;

    if (!finalAudienceLabel) {
      return res.status(400).json({ message: "audience_label is required" });
    }

    const sectionList = splitSectionNames(section_names ?? section_ids ?? sections);
    const normalizedSectionNames = normalizeSectionNames(sectionList);

    if (!normalizedSectionNames) {
      return res.status(400).json({ message: "section_names is required and must contain section names" });
    }

    const existingSections = await Section.findAll({
      where: {
        section_name: sectionList
      }
    });

    if (existingSections.length !== sectionList.length) {
      const existingNames = new Set(existingSections.map((section) => section.section_name));
      const missingSection = sectionList.find((sectionName) => !existingNames.has(sectionName));
      return res.status(404).json({ message: `Section not found: ${missingSection}` });
    }

    const duplicateAudience = await Audience.findOne({
      where: {
        audience_label: finalAudienceLabel
      }
    });

    if (duplicateAudience) {
      return res.status(400).json({ message: "Audience label already exists" });
    }

    const transaction = await Audience.sequelize.transaction();

    try {
      const newAudience = await Audience.create({
        audience_label: finalAudienceLabel,
        section_names: normalizedSectionNames,
        is_compulsory
      }, { transaction });

      await syncAudienceSections(newAudience.audience_id, sectionList, transaction);
      await transaction.commit();

      res.status(201).json({
        message: "Audience created successfully",
        data: newAudience
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    res.status(500).json({ message: "Error creating audience", error: error.message });
  }
};

export const getAllAudiences = async (req, res) => {
  try {
    const audiences = await Audience.findAll({
      include: [{ model: Section }]
    });
    res.status(200).json({
      message: "Audiences retrieved successfully",
      data: audiences
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving audiences", error: error.message });
  }
};

export const getAudienceById = async (req, res) => {
  try {
    const { id } = req.params;
    const audience = await Audience.findByPk(id, {
      include: [{ model: Section }]
    });

    if (!audience) {
      return res.status(404).json({ message: "Audience not found" });
    }

    res.status(200).json({
      message: "Audience retrieved successfully",
      data: audience
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving audience", error: error.message });
  }
};

export const updateAudience = async (req, res) => {
  try {
    const { id } = req.params;
    const { audience_label, audience_name, section_names, section_ids, sections, is_compulsory } = req.body;

    const audience = await Audience.findByPk(id);

    if (!audience) {
      return res.status(404).json({ message: "Audience not found" });
    }

    const sectionList = splitSectionNames(section_names ?? section_ids ?? sections);
    const normalizedSectionNames = normalizeSectionNames(sectionList);
    const updates = {};
    const finalAudienceLabel = audience_label ?? audience_name;

    if (finalAudienceLabel !== undefined) {
      const duplicateAudience = await Audience.findOne({
        where: {
          audience_label: finalAudienceLabel
        }
      });

      if (duplicateAudience && duplicateAudience.audience_id !== audience.audience_id) {
        return res.status(400).json({ message: "Audience label already exists" });
      }

      updates.audience_label = finalAudienceLabel;
    }

    if (normalizedSectionNames !== undefined) {
      updates.section_names = normalizedSectionNames;
    }

    if (is_compulsory !== undefined) {
      updates.is_compulsory = is_compulsory;
    }

    if (section_names !== undefined || section_ids !== undefined || sections !== undefined) {
      if (!normalizedSectionNames) {
        return res.status(400).json({ message: "section_names must contain at least one section" });
      }

      const existingSections = await Section.findAll({
        where: {
          section_name: sectionList
        }
      });

      if (existingSections.length !== sectionList.length) {
        const existingNames = new Set(existingSections.map((section) => section.section_name));
        const missingSection = sectionList.find((sectionName) => !existingNames.has(sectionName));
        return res.status(404).json({ message: `Section not found: ${missingSection}` });
      }
    }

    const transaction = await Audience.sequelize.transaction();

    try {
      await audience.update(updates, { transaction });

      if (section_names !== undefined || section_ids !== undefined || sections !== undefined) {
        await syncAudienceSections(audience.audience_id, sectionList, transaction);
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    res.status(200).json({
      message: "Audience updated successfully",
      data: audience
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating audience", error: error.message });
  }
};

export const deleteAudience = async (req, res) => {
  try {
    const { id } = req.params;
    const audience = await Audience.findByPk(id);

    if (!audience) {
      return res.status(404).json({ message: "Audience not found" });
    }

    const transaction = await Audience.sequelize.transaction();

    try {
      await AudienceSection.destroy({
        where: {
          audience_id: id
        },
        transaction
      });

      await audience.destroy({ transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    res.status(200).json({
      message: "Audience deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting audience", error: error.message });
  }
};
