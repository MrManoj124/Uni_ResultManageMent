exports.calculateGrade = (marks) => {
  if (marks >= 90) return { grade: 'A+', points: 4.0 };
  if (marks >= 85) return { grade: 'A', points: 4.0 };
  if (marks >= 80) return { grade: 'A-', points: 3.7 };
  if (marks >= 75) return { grade: 'B+', points: 3.3 };
  if (marks >= 70) return { grade: 'B', points: 3.0 };
  if (marks >= 65) return { grade: 'B-', points: 2.7 };
  if (marks >= 60) return { grade: 'C+', points: 2.3 };
  if (marks >= 55) return { grade: 'C', points: 2.0 };
  if (marks >= 50) return { grade: 'C-', points: 1.7 };
  if (marks >= 40) return { grade: 'D', points: 1.0 };
  return { grade: 'F', points: 0.0 };
};

exports.calculateGPA = (results) => {
  if (!results || results.length === 0) return 0;

  let totalPoints = 0;
  let totalCredits = 0;

  results.forEach(result => {
    if (result.courseId && result.courseId.credits) {
      totalPoints += result.gradePoints * result.courseId.credits;
      totalCredits += result.courseId.credits;
    }
  });

  return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
};

exports.calculateCGPA = (allResults) => {
  return this.calculateGPA(allResults);
};

exports.getGradeDistribution = (results) => {
  const distribution = {};
  results.forEach(result => {
    distribution[result.grade] = (distribution[result.grade] || 0) + 1;
  });
  return distribution;
};

exports.getPassRate = (results) => {
  if (results.length === 0) return 0;
  const passedCount = results.filter(r => r.grade !== 'F').length;
  return ((passedCount / results.length) * 100).toFixed(2);
};