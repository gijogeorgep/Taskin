import { useState, useEffect } from "react";
import { User, Camera, X, Plus } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
function ProfileSettings() {
  // Your original useAuthStore hook (keeping your real data)
  const { authUser, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    profilePic: "",
    customFieldData: {},
  });

  const [customFields, setCustomFields] = useState([]);
  const [customFieldData, setCustomFieldData] = useState({});
  const [imageHover, setImageHover] = useState(false);

  // Your original useEffect - keeping all your data logic
  useEffect(() => {
    if (authUser && !isEditing) {
      setFormData({
        name: authUser.name || "",
        bio: authUser.bio || "",
        profilePic: authUser.profilePic || "",
        customFieldData: authUser.customFieldData || {},
      });

      const mergedCustomData = {};

      if (Array.isArray(authUser.customField)) {
        authUser.customField.forEach((field) => {
          const storedValue = authUser.customFieldData?.[field.fieldName];
          let finalValue = storedValue ?? field.value ?? "";

          if (field.fieldType === "boolean") {
            if (storedValue !== undefined) {
              finalValue =
                storedValue === true || storedValue === "Yes" ? "Yes" : "No";
            } else if (field.value !== undefined) {
              finalValue =
                field.value === true || field.value === "Yes" ? "Yes" : "No";
            } else {
              finalValue = "No";
            }
          }

          if (field.fieldType === "number" && typeof finalValue === "string") {
            finalValue = parseFloat(finalValue) || 0;
          }

          mergedCustomData[field.fieldName] = finalValue;
        });
      }

      setCustomFields(authUser.customField || []);
      setCustomFieldData(mergedCustomData);
    }
  }, [authUser, isEditing]);

  // Your original functions - keeping all your logic
  const handleCustomFieldChange = (fieldName, value) => {
    setCustomFieldData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Your original image upload with Cloudinary
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", import.meta.env.VITE_CLOUD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUD_NAME
        }/image/upload`,
        {
          method: "POST",
          body: data,
        }
      );

      const cloudData = await res.json();
      if (cloudData.secure_url) {
        setFormData({ ...formData, profilePic: cloudData.secure_url });
      }
    } catch (error) {
      console.error("Image upload failed", error);
    }
  };

  // Your original save function
  const handleSave = async () => {
    try {
      const updatedPayload = {
        name: formData.name,
        bio: formData.bio,
        profilePic: formData.profilePic,
        customFieldData: { ...customFieldData },
      };

      await updateProfile(updatedPayload);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 dark:from-[#1e1f23] dark:via-[#252526] dark:to-[#2c2d31]">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl "></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-4xl mx-auto">
        {/* Main glassmorphism container */}
       <div className="backdrop-blur-xl 
  bg-white/70 dark:bg-[#1e1f23]/70 
  rounded-3xl shadow-2xl 
  border border-white/20 dark:border-gray-700 
  p-8 sm:p-12">

          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center gap-8 mb-10">
            <div 
              className="relative group"
              onMouseEnter={() => setImageHover(true)}
              onMouseLeave={() => setImageHover(false)}
            >
              {formData.profilePic ? (
                <div className="relative">
                  <img
                    src={formData.profilePic}
                    alt="Profile"
                    className="w-32 h-32 rounded-3xl object-cover shadow-xl ring-4 ring-white/50 transition-all duration-300 group-hover:scale-105"
                  />
                  {isEditing && (
                    <div className={`absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center transition-opacity duration-300 ${imageHover ? 'opacity-100' : 'opacity-0'}`}>
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center shadow-xl ring-4 ring-white/50 transition-all duration-300 group-hover:scale-105">
                  <img
                    src="https://img.icons8.com/fluency/48/test-account--v1.png"
                    alt="Default Profile"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              {/* Name */}
              {isEditing ? (
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="text-3xl font-bold bg-white/60 backdrop-blur-sm rounded-2xl px-4 py-2 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-300 w-full"
                  placeholder="Enter your name"
                />
              ) : (
                <h1 className="text-4xl font-bold 
  bg-gradient-to-r from-gray-800 to-gray-600 
  dark:from-gray-200 dark:to-gray-400 
  bg-clip-text text-transparent mb-2">

                  {authUser?.name || "Your Name"}
                </h1>
              )}
              
              {/* Role and Email */}
              <div className="space-y-1 mt-4">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100/70 backdrop-blur-sm border border-blue-200/30">
                  <span className="text-blue-800 font-medium">{authUser?.role || "Role"}</span>
                </div>
                <p className="text-gray-600 mt-2">{authUser?.email || "email@example.com"}</p>
              </div>

              {/* Upload controls */}
              {isEditing && (
                <div className="flex flex-wrap gap-3 mt-4">
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl">
                    <Camera className="w-4 h-4" />
                    <span className="text-sm font-medium">Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {formData.profilePic && (
                    <button
                      onClick={() => setFormData({ ...formData, profilePic: "" })}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <X className="w-4 h-4" />
                      <span className="text-sm font-medium">Remove</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-10"></div>

          {/* Bio Section */}
          <div className="mb-10">
            <label className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-4">
              <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
              Bio
            </label>
            {isEditing ? (
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full px-6 py-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-300 resize-none"
                rows="4"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <div className="px-6 py-4 rounded-2xl bg-gradient-to-r from-white/50 to-white/30 backdrop-blur-sm border border-white/20">
                <p className="text-gray-700 leading-relaxed dark:text-gray-300">
                  {authUser?.bio || (
                    <span className="italic text-gray-400 flex items-center gap-2 dark:text-gray-500">
                      <Plus className="w-4 h-4" />
                      Add your bio
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Custom Fields - Your original logic */}
          {customFields.length > 0 && (
            <div className="mb-10">
              <label className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-6 dark:text-gray-300">
                <div className="w-2 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                Additional Information
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {customFields.map((field) => (
                  <div key={field._id} className="space-y-3">
                    <label className="text-sm font-semibold text-gray-600 flex items-center gap-2 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      {field.fieldName}
                    </label>

                    {isEditing ? (
                      <div className="space-y-2">
                        {field.fieldType === "boolean" ? (
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() =>
                                handleCustomFieldChange(
                                  field.fieldName,
                                  customFieldData[field.fieldName] === "Yes" ? "No" : "Yes"
                                )
                              }
                              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                                customFieldData[field.fieldName] === "Yes"
                                  ? "bg-gradient-to-r from-green-400 to-green-500 shadow-lg"
                                  : "bg-gradient-to-r from-gray-300 to-gray-400"
                              }`}
                            >
                              <span
                                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                                  customFieldData[field.fieldName] === "Yes" ? "translate-x-9" : "translate-x-1"
                                }`}
                              />
                            </button>
                            <span className="text-sm font-medium text-gray-700">
                              {customFieldData[field.fieldName] === "Yes" ? "Yes" : "No"}
                            </span>
                          </div>
                        ) : field.fieldType === "date" ? (
                          <input
                            type="date"
                            value={customFieldData[field.fieldName] || ""}
                            onChange={(e) => handleCustomFieldChange(field.fieldName, e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/60 backdrop-blur-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-300"
                          />
                        ) : field.fieldType === "dropdown" && Array.isArray(field.options) ? (
                          <select
                            value={customFieldData[field.fieldName] || ""}
                            onChange={(e) => handleCustomFieldChange(field.fieldName, e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/60 backdrop-blur-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-300"
                          >
                            <option value="">Select an option</option>
                            {field.options.map((opt, idx) => (
                              <option key={idx} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.fieldType}
                            value={customFieldData[field.fieldName] || ""}
                            onChange={(e) => handleCustomFieldChange(field.fieldName, e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/60 backdrop-blur-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-300"
                            placeholder={`Enter ${field.fieldName.toLowerCase()}`}
                          />
                        )}
                      </div>
                    ) : (
                      <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-white/40 to-white/20 backdrop-blur-sm border border-white/20">
                        {customFieldData[field.fieldName] || field.value ? (
                          <p className="text-gray-700 font-medium">
                            {customFieldData[field.fieldName] || field.value}
                          </p>
                        ) : (
                          <button
                            onClick={() => setIsEditing(true)}
                            className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-2 font-medium transition-colors duration-200"
                          >
                            <Plus className="w-4 h-4" />
                            Add {field.fieldName}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setFormData({
                      name: authUser.name || "",
                      bio: authUser.bio || "",
                      profilePic: authUser.profilePic || "",
                      customFieldData: authUser.customFieldData || {},
                    });
                    setIsEditing(false);
                  }}
                  className="px-8 py-3 rounded-2xl bg-white/60 backdrop-blur-sm text-gray-700 font-semibold hover:bg-white/80 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/30"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-3 px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <User className="w-5 h-5" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileSettings;