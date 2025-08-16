import React, { useState, useEffect } from "react";
import { useTaskStore } from "../store/useTaskStore";
import { useAuthStore } from "../store/useAuthStore";

function TaskComment({ onClose, task }) {
  const [commentText, setCommentText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const { authUser } = useAuthStore();

  const {
    comments,
    fetchComments,
    addComment,
    updateComment,
    loading,
    deleteComment,
  } = useTaskStore();

  const hasEditPermission = (comment) => {
    const roleName = authUser?.role?.toLowerCase?.() || "";
    const assignedToId = comment?.createdBy?._id;

    const canEdit =
      ["admin", "super admin"].includes(roleName) ||
      authUser?._id === assignedToId;

    return canEdit;
  };

  useEffect(() => {
    if (task?._id) {
      fetchComments(task._id);
    }
  }, [task]);

  return (
    <div className="bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-xl p-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800">Comments</h3>
        </div>
        <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </div>
      </div>

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="mb-6 max-h-80 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {comments.map((comment,) => (
            <div
              key={comment._id}
              className="group relative bg-white/80 backdrop-blur-sm border border-gray-200/80 rounded-xl p-4 shadow-sm hover:shadow-md hover:bg-white transition-all duration-200"
            >
              {editingId === comment._id ? (
                <div className="space-y-4">
                  <div className="relative">
                    <textarea
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      className="w-full bg-white border-2 border-blue-200 rounded-xl p-4 resize-none focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-700 placeholder-gray-400"
                      rows={3}
                      placeholder="Edit your comment..."
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => {
                        updateComment(task._id, comment._id, editedText);
                        setEditingId(null);
                        setEditedText("");
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-4 focus:ring-green-200 transform hover:scale-105 transition-all duration-200 shadow-md"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditedText("");
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 mt-0.5">
                      {(comment.createdBy?.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-800 leading-relaxed break-words">
                        {comment.text}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm font-medium text-gray-600">
                          {comment.createdBy?.name || "Unknown user"}
                        </span>
                        
                        
                      </div>
                    </div>
                  </div>
                  
                  {hasEditPermission(comment) && (
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => {
                          setEditingId(comment._id);
                          setEditedText(comment.text);
                        }}
                        className="text-blue-600 text-sm font-medium hover:text-blue-700 hover:bg-blue-50 px-3 py-1 rounded-lg transition-all duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(comment._id)}
                        className="text-red-600 text-sm font-medium hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg transition-all duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 mb-6">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No comments yet</p>
          <p className="text-sm text-gray-400 mt-1">Be the first to share your thoughts!</p>
        </div>
      )}

      {/* Add Comment Section */}
      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={commentText}
            required
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full p-4 h-24 bg-white border-2 border-gray-200 rounded-xl resize-none focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-700 placeholder-gray-400"
            rows={3}
            placeholder="Share your thoughts..."
          />
          <div className="absolute bottom-3 right-3 text-xs text-gray-400">
            {commentText.length}/500
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            💡 Press Ctrl+Enter to submit quickly
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl border border-gray-200 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-200"
            >
              Close
            </button>
            <button
              onClick={() =>
                addComment(task._id, {
                  text: commentText,
                  userId: task.assignedTo?._id,
                }).then(() => setCommentText(""))
              }
              disabled={loading || !commentText.trim()}
              className={`px-6 py-2.5 rounded-xl font-medium text-white transition-all duration-200 focus:outline-none focus:ring-4 transform hover:scale-105 ${
                loading || !commentText.trim()
                  ? "bg-gray-300 cursor-not-allowed scale-100"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:ring-blue-200 shadow-lg"
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Add Comment
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-2xl border border-gray-200">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Comment</h3>
                <p className="text-gray-600">
                  Are you sure you want to delete this comment? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    deleteComment(task._id, confirmDeleteId);
                    setConfirmDeleteId(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-red-200 transform hover:scale-105 shadow-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskComment;