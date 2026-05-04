import { Section, Schedule, Audience, AudienceSection } from '../models/index.js';

export const createSection = async (req, res) => {
  try {
    const { section_name } = req.body;
    
    // Input validation
    if (!section_name) {
      return res.status(400).json({ message: "section_name is required" });
    }

    const newSection = await Section.create({ section_name });

    res.status(201).json({
      message: "Section created successfully",
      data: newSection
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: "Validation error", 
        details: error.errors.map(e => e.message) 
      });
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: "Section name already exists" });
    }
    res.status(500).json({ message: "Error creating section", error: error.message });
  }
};

export const getAllSections = async (req, res) => {
  try {
    const sections = await Section.findAll();
    res.status(200).json({
      message: "Sections retrieved successfully",
      data: sections
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving sections", error: error.message });
  }
};

export const getSectionById = async (req, res) => {
  try {
    const { section_name } = req.params;

    if (!section_name) {
      return res.status(400).json({ message: "section_name is required" });
    }

    const section = await Section.findByPk(section_name);

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    res.status(200).json({
      message: "Section retrieved successfully",
      data: section
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving section", error: error.message });
  }
};

export const updateSection = async (req, res) => {
  try {
    const { section_name } = req.params;
    const { section_name: nextSectionName } = req.body;

    if (!section_name) {
      return res.status(400).json({ message: "section_name is required" });
    }

    const section = await Section.findByPk(section_name);

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    if (!nextSectionName) {
      return res.status(400).json({ message: "section_name is required in the request body" });
    }

    if (nextSectionName !== section_name) {
      const existingSection = await Section.findByPk(nextSectionName);
      if (existingSection) {
        return res.status(400).json({ message: "Section name already exists" });
      }
    }

    const transaction = await Section.sequelize.transaction();

    try {
      if (nextSectionName !== section_name) {
        await Schedule.update(
          { section_name: nextSectionName },
          { where: { section_name }, transaction }
        );

        const linkedAudienceSections = await AudienceSection.findAll({
          where: { section_name },
          transaction
        });
        const linkedAudienceIds = [...new Set(linkedAudienceSections.map((row) => row.audience_id))];

        await AudienceSection.update(
          { section_name: nextSectionName },
          { where: { section_name }, transaction }
        );

        const audiences = linkedAudienceIds.length
          ? await Audience.findAll({
              where: {
                audience_id: linkedAudienceIds
              },
              transaction
            })
          : [];

        for (const audience of audiences) {
          const sections = String(audience.section_names || '')
            .split('+')
            .map((item) => item.trim())
            .filter(Boolean)
            .map((item) => (item === section_name ? nextSectionName : item));

          const uniqueSections = [...new Set(sections)];
          await audience.update({ section_names: uniqueSections.join('+') }, { transaction });
        }
      }

      await section.update({ section_name: nextSectionName }, { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    res.status(200).json({
      message: "Section updated successfully",
      data: section
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: "Section name already exists" });
    }
    res.status(500).json({ message: "Error updating section", error: error.message });
  }
};

export const deleteSection = async (req, res) => {
  try {
    const { section_name } = req.params;

    if (!section_name) {
      return res.status(400).json({ message: "section_name is required" });
    }

    const section = await Section.findByPk(section_name);

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    const transaction = await Section.sequelize.transaction();

    try {
      await Schedule.destroy({ where: { section_name }, transaction });
      const linkedAudienceSections = await AudienceSection.findAll({
        where: { section_name },
        transaction
      });
      const linkedAudienceIds = [...new Set(linkedAudienceSections.map((row) => row.audience_id))];
      await AudienceSection.destroy({ where: { section_name }, transaction });

      const audiences = linkedAudienceIds.length
        ? await Audience.findAll({
            where: {
              audience_id: linkedAudienceIds
            },
            transaction
          })
        : [];

      for (const audience of audiences) {
        const sections = String(audience.section_names || '')
          .split('+')
          .map((item) => item.trim())
          .filter(Boolean)
          .filter((item) => item !== section_name);

        await audience.update({ section_names: sections.join('+') }, { transaction });
      }

      await section.destroy({ transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    res.status(200).json({
      message: "Section deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting section", error: error.message });
  }
};
