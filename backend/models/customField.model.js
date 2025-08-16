import mongoose from "mongoose";
const customFieldSchema = new mongoose.Schema({
  fieldName: { type: String, required: true },
  fieldType: {
    type: String,
    required: true,
    enum: ["text", "number", "date", "boolean", "dropdown"],
  },
  appliesTo: {
    type: String,
    required: true,
    enum: ["users", "projects", "tasks"],
  },
  target: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "appliesTo",
    required: true,
  },

  options: {
    type: [String], 
    default: undefined,
  },

  

});

const CustomField = mongoose.model("CustomField", customFieldSchema);
export default CustomField;
