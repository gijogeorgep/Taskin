// components/ProjectMembersCard.jsx
import React from "react";

const ProjectMembersCard = ({ user, isSelected, onToggle }) => {
  return (
    <div key={user._id} className="flex items-start gap-2 mb-4">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggle(user._id)}
        id={`member-${user._id}`}
        className="accent-blue-600 mt-1"
      />
      <label htmlFor={`member-${user._id}`} className="leading-tight">
        <p className="font-bold text-white">{user.name}</p>
        <p className="text-sm text-gray-300 font-medium">
          {user.globalRole?.name}
        </p>
        <p className="text-sm text-gray-400">{user.email}</p>
      </label>
    </div>
  );
};

export default ProjectMembersCard;
