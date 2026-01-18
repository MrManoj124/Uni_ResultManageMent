// src/components/AddModal.jsx
import React, { useState } from 'react';
import { calculateGrade } from '../utils/helpers';

const AddModal = ({ type, students, courses, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-t-2xl">
          <h3 className="text-xl font-bold capitalize">Add New {type}</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {type === 'student' && (
            <>
              <FormField
                label="Student ID"
                type="text"
                value={formData.studentId || ''}
                onChange={(e) => handleChange('studentId', e.target.value)}
                placeholder="e.g., 2021/ICT/XX"
                required
              />
              <FormField
                label="Full Name"
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter full name"
                required
              />
              <FormField
                label="Email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="student@uva.lk"
                required
              />
              <FormField
                label="Program"
                type="text"
                value={formData.program || ''}
                onChange={(e) => handleChange('program', e.target.value)}
                placeholder="e.g., BSc IT"
                required
              />
            </>
          )}

          {type === 'course' && (
            <>
              <FormField
                label="Course Code"
                type="text"
                value={formData.code || ''}
                onChange={(e) => handleChange('code', e.target.value)}
                placeholder="e.g., IT3162"
                required
              />
              <FormField
                label="Course Name"
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter course name"
                required
              />
              <FormField
                label="Credits"
                type="number"
                value={formData.credits || ''}
                onChange={(e) => handleChange('credits', e.target.value)}
                placeholder="e.g., 3"
                min="1"
                max="6"
                required
              />
              <FormField
                label="Semester"
                type="text"
                value={formData.semester || ''}
                onChange={(e) => handleChange('semester', e.target.value)}
                placeholder="e.g., 6"
                required
              />
            </>
          )}

          {type === 'result' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student ID
                </label>
                <select
                  value={formData.studentId || ''}
                  onChange={(e) => handleChange('studentId', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Student</option>
                  {students.map(student => (
                    <option key={student._id || student.studentId} value={student.studentId}>
                      {student.studentId} - {student.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course
                </label>
                <select
                  value={formData.courseId || ''}
                  onChange={(e) => handleChange('courseId', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <FormField
                label="Marks"
                type="number"
                value={formData.marks || ''}
                onChange={(e) => handleChange('marks', e.target.value)}
                placeholder="Enter marks (0-100)"
                min="0"
                max="100"
                required
              />

              {formData.marks && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Calculated Grade: </span>
                    <span className="text-blue-600 font-bold">
                      {calculateGrade(parseInt(formData.marks)).grade}
                    </span>
                  </p>
                </div>
              )}

              <FormField
                label="Academic Year (Optional)"
                type="text"
                value={formData.academicYear || ''}
                onChange={(e) => handleChange('academicYear', e.target.value)}
                placeholder="e.g., 2024/2025"
              />
            </>
          )}

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
              Add {type}
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

// Internal FormField (deprecated in favor of exported ones but kept for local use if any)
const FormField = FormInput;

export default AddModal;