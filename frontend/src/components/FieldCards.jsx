import React, { useState } from "react";
import { useCustomField } from "../store/useCustomFieldStore";
import { SquarePen, Trash } from "lucide-react";
import EditFieldPopup from "./EditFieldPopup";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

function FieldCards() {
  const customFields = useCustomField((state) => state.customFields);

  const deleteField = useCustomField((state) => state.deleteField);
  const [editingField, setEditingField] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const { authUser } = useAuthStore();
  
  const getRoleName = () => {
    return authUser?.role?.toLowerCase?.() || "";
  };
  
  const hasEditPermission = () => {
    const roleName = getRoleName();

    const canEdit = ["admin", "super admin", "manager"].includes(roleName);

    if (!canEdit) {
      toast.error("Permission denied.");
      return false;
    }

    return true;
  };

  const handleEdit = (field) => {
    if (!hasEditPermission(field)) {
      return;
    }
    setEditingField(field);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setEditingField(null);
  };
     
  const toTitleCase = (str) =>
    str?.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div className="w-full px-6 py-10">
      {showPopup && (
        <EditFieldPopup
          isOpen={showPopup}
          onClose={handleClosePopup}
          editMode={true}
          fieldData={editingField}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {customFields?.length === 0 ? (
          <div className="text-gray-600 col-span-full text-center text-lg py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <SquarePen size={24} className="text-gray-400" />
              </div>
              <p className="font-medium">No custom fields found.</p>
              <p className="text-sm text-gray-500">Create your first custom field to get started.</p>
            </div>
          </div>
        ) : (
          customFields?.map((field) => {
            if (!field) return null;

            return (
              <div
                key={field._id}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-300 relative group"
              >
                {/* Header with title and actions */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 pr-4">
                    <h3 className="font-bold text-xl text-gray-900 leading-tight">
                      {toTitleCase(field.fieldName) || "Unnamed Field"}
                    </h3>
                  </div>
                  
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => handleEdit(field)}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <SquarePen size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (!hasEditPermission(field)) {
                          return;
                        }
                        const confirmed = window.confirm(
                          "Are you sure you want to delete this field?"
                        );
                        if (!confirmed) return;
                        deleteField(field._id);
                      }}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>

                {/* Applies To Badge */}
                <div className="mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {toTitleCase(field.appliesTo) || "N/A"}
                  </span>
                </div>

                {/* Field Type */}
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 font-medium">Type:</span>
                    <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-md">
                      {toTitleCase(field.fieldType) || "Unknown Type"}
                    </span>
                  </div>
                </div>

                {/* Options for dropdown */}
                {field.fieldType === "dropdown" &&
                  Array.isArray(field.options) &&
                  field.options.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Options:</h4>
                      <div className="flex flex-wrap gap-2">
                        {field.options.slice(0, 4).map((option, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200"
                          >
                            {option}
                          </span>
                        ))}
                        {field.options.length > 4 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-gray-500">
                            +{field.options.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default FieldCards;