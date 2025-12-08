const csv=require('csv-parser');
const fs=require('fs');

exports.parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

exports.validateResultsCSV = (data) => {
  const errors = [];
  const validResults = [];

  data.forEach((row, index) => {
    const rowNum = index + 2; // +2 because index starts at 0 and row 1 is header

    // Validate required fields
    if (!row.studentId || !row.courseId || !row.marks) {
      errors.push({
        row: rowNum,
        error: 'Missing required fields (studentId, courseId, marks)'
      });
      return;
    }

    // Validate marks range
    const marks = parseInt(row.marks);
    if (isNaN(marks) || marks < 0 || marks > 100) {
      errors.push({
        row: rowNum,
        error: 'Marks must be a number between 0 and 100'
      });
      return;
    }

    validResults.push({
      studentId: row.studentId.trim(),
      courseId: row.courseId.trim(),
      marks: marks,
      academicYear: row.academicYear || new Date().getFullYear().toString()
    });
  });

  return { validResults, errors };
};