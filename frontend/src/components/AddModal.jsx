// src/components/AddModal.jsx
import React from 'react';

const AddModal = ({ isOpen, onClose, title, onSubmit, submitText = 'Submit', children }) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-t-2xl">
          <h3 className="text-xl font-bold">{title}</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {children}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-lg hover:from-indigo-700 hover:to-purple-800 transition font-medium"
            >
              {submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Form Input Component
export const FormInput = ({ label, type = 'text', value, onChange, placeholder, required, min, max, name }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
      />
    </div>
  );
};

// Form Select Component
export const FormSelect = ({ label, name, options, value, onChange, required }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        required={required}
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AddModal;