import React from 'react'

const DeleteConfirmationToast = ({ onConfirm, onCancel, userName }) => {
    return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        
        <div className="flex flex-col gap-3">
        
        <p className="text-gray-800 font-medium">
            Delete all chats with {userName || 'this user'}?
        </p>
        
        <div className="flex gap-2 justify-end mt-2">
            <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
            Cancel
            </button>
        
            <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
            >
            Delete Chat
            </button>
        
        </div>
        </div>
    
    </div>
    
    );
    
};

export default DeleteConfirmationToast
