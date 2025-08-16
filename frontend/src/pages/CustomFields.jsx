import React, { useState } from "react";
import FieldCards from "../components/FieldCards";
import CreateFieldPopup from "../components/CreateFieldPopup";
import { Plus } from "lucide-react";
import { useEffect } from "react";
import { useCustomField } from "../store/useCustomFieldStore";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";

function CustomFields() {
  const [isField, setIsField] = useState(false);
  const { authUser } = useAuthStore();

  const fetchFields = useCustomField((state) => state.fetchFields);
  const loading = useCustomField((state) => state.loading);
  const error = useCustomField((state) => state.error);

  useEffect(() => {
    fetchFields();
  }, [fetchFields]);

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
  
  const openField = () => {
    setIsField(true);
  };
  
  const closeField = () => {
    setIsField(false);
  };
  
  return (
    <div className="flex flex-col gap-5 pt-10 bg-gray-50 w-full min-h-screen px-4 sm:px-6 lg:px-10 xl:pl-[20%]">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
        <div className="flex flex-col items-start text-gray-900 gap-2">
          <h1 className="text-3xl sm:text-4xl font-serif">Custom Fields</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Configure custom fields for projects, tasks, and users
          </p>
        </div>
        <button
          onClick={() => {
            if (!hasEditPermission()) return;

            openField();
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={20} /> Add Custom Field
        </button>
      </div>

      {isField && <CreateFieldPopup closeField={closeField} />}

      {loading ? (
        <p className="text-gray-700 text-center mt-5">Loading custom fields...</p>
      ) : error ? (
        <p className="text-red-600 text-center mt-5">Error: {error}</p>
      ) : (
        <FieldCards />
      )}
    </div>
  );
}

export default CustomFields;