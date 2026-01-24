// src/components/AddModal.jsx
import React from 'react';

const AddModal = ({ isOpen, onClose, title, onSubmit, submitText = 'Submit', children }) =& gt; {
  if (!isOpen) return null;

  const handleSubmit = (e) =& gt; {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    & lt;div className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" & gt;
      & lt;div className = "bg-white rounded-2xl shadow-2xl w-full max-w-md" & gt;
        & lt;div className = "px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-t-2xl" & gt;
          & lt;h3 className = "text-xl font-bold" & gt; { title }& lt;/h3&gt;
        & lt;/div&gt;

        & lt;form onSubmit = { handleSubmit } className = "p-6 space-y-4" & gt;
  { children }

          & lt;div className = "flex space-x-3 pt-4" & gt;
            & lt; button
  type = "button"
  onClick = { onClose }
  className = "flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
    & gt;
  Cancel
    & lt;/button&gt;
            & lt; button
  type = "submit"
  className = "flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-lg hover:from-indigo-700 hover:to-purple-800 transition font-medium"
    & gt;
  { submitText }
            & lt;/button&gt;
          & lt;/div&gt;
        & lt;/form&gt;
      & lt;/div&gt;
    & lt;/div&gt;
  );
};

// Form Input Component
export const FormInput = ({ label, type = 'text', value, onChange, placeholder, required, min, max, name }) =& gt; {
  return (
    & lt; div & gt;
      & lt;label className = "block text-sm font-medium text-gray-700 mb-2" & gt;
  { label }
      & lt;/label&gt;
      & lt; input
  type = { type }
  name = { name }
  value = { value }
  onChange = { onChange }
  className = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
  placeholder = { placeholder }
  required = { required }
  min = { min }
  max = { max }
    /& gt;
    & lt;/div&gt;
  );
};

// Form Select Component
export const FormSelect = ({ label, name, options, value, onChange, required }) =& gt; {
  return (
    & lt; div & gt;
      & lt;label className = "block text-sm font-medium text-gray-700 mb-2" & gt;
  { label }
      & lt;/label&gt;
      & lt; select
  name = { name }
  value = { value }
  onChange = { onChange }
  className = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
  required = { required }
    & gt;
        & lt;option value = "" & gt;Select { label }& lt;/option&gt;
  {
    options.map((option) =& gt; (
          & lt;option key = { option.value } value = { option.value } & gt;
    { option.label }
          & lt;/option&gt;
        ))
  }
      & lt;/select&gt;
    & lt;/div&gt;
  );
};

export default AddModal;