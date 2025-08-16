import CustomField from "../models/customField.model.js";

export const createCustomField = async (req, res) => {
  try {
    const { fieldName, fieldType, appliesTo, target, value, options } =
      req.body;

    if (!fieldName || !fieldType || !appliesTo || !target) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newField = new CustomField({
      fieldName,
      fieldType,
      appliesTo,
      target,
      value,
      options,
    });

    if (newField) {
      await newField.save();
    }
    console.log("New custom field created:", newField);

    return res.status(200).json({ newField });
  } catch (error) {
    console.log("Error creating custom field:", error.message);

    return res
      .status(500)
      .json({ message: "Error creating custom field", error: error.message });
  }
};

export const getCustomFields = async (req, res) => {
  try {
    const customFields = await CustomField.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ customFields });
  } catch (error) {
    console.log("Error getting custom fields:", error.message);
    return res
      .status(500)
      .json({ message: "Error getting custom fields", error: error.message });
  }
};

export const updateCustomField = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fieldName,
      fieldType,
      appliesTo,

      target,
      value,
      options,
    } = req.body;
    if (!fieldName || !fieldType || !appliesTo) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const updatedField = await CustomField.findByIdAndUpdate(
      id,
      { fieldName, fieldType, appliesTo, target, value, options },
      { new: true, runValidators: true }
    );
    console.log(updatedField, "Updated custom field");

    return res.status(200).json({ updatedField });
  } catch (error) {
    console.log("Error from  updating custom field:", error.message);
    return res.status(500).json({
      msg: "Error from updating custom field",
      error: error.message,
    });
  }
};
export const deleteCustomField = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Custom field ID is required" });
    }

    const deleted = await CustomField.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Custom field not found" });
    }

    return res
      .status(200)
      .json({ message: "Custom field deleted successfully" });
  } catch (error) {
    console.error("Error deleting custom field:", error.message);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
