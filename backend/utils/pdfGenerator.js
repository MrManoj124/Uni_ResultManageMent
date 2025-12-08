const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.generateResultSheet = async (student, results, gpa) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const filename = `result-${student.studentId}-${Date.now()}.pdf`;
      const filepath = path.join(__dirname, '../uploads/results/', filename);

      // Create directory if not exists
      const dir = path.dirname(filepath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // Header
      doc.fontSize(20).text('ResultPro', { align: 'center' });
      doc.fontSize(16).text('University of Vavuniya', { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text('Student Result Sheet', { align: 'center' });
      doc.moveDown(2);

      // Student Info
      doc.fontSize(12);
      doc.text(`Student ID: ${student.studentId}`);
      doc.text(`Name: ${student.name.fullName || student.name}`);
      doc.text(`Program: ${student.program}`);
      doc.text(`Academic Year: ${new Date().getFullYear()}`);
      doc.moveDown(2);

      // Results Table
      doc.fontSize(14).text('Results:', { underline: true });
      doc.moveDown();

      // Table Headers
      const tableTop = doc.y;
      const col1 = 50;
      const col2 = 200;
      const col3 = 350;
      const col4 = 420;
      const col5 = 490;

      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Course Code', col1, tableTop);
      doc.text('Course Name', col2, tableTop);
      doc.text('Credits', col3, tableTop);
      doc.text('Marks', col4, tableTop);
      doc.text('Grade', col5, tableTop);

      doc.moveDown();
      let currentY = doc.y;

      // Table Data
      doc.font('Helvetica');
      results.forEach((result, index) => {
        if (currentY > 700) { // New page if needed
          doc.addPage();
          currentY = 50;
        }

        doc.text(result.courseId.code, col1, currentY);
        doc.text(result.courseId.name.substring(0, 20), col2, currentY);
        doc.text(result.courseId.credits.toString(), col3, currentY);
        doc.text(result.marks.toString(), col4, currentY);
        doc.text(result.grade, col5, currentY);

        currentY += 20;
      });

      // GPA
      doc.moveDown(3);
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text(`CGPA: ${gpa}`, { align: 'right' });

      // Footer
      doc.moveDown(3);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.text('This is a computer-generated document', { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        resolve({ filename, filepath });
      });

      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};