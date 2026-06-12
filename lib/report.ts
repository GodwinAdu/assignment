import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export interface ReportData {
  title: string;
  month?: string;
  employees?: Array<{
    name: string;
    email: string;
    department: string;
    attendance?: number;
    hoursWorked?: number;
    punctuality?: number;
    score?: number;
  }>;
  summary?: {
    totalEmployees: number;
    presentDays: number;
    absentDays: number;
    attendanceRate: number;
    averageScore: number;
  };
}

export function generatePDF(data: ReportData): Buffer {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(102, 126, 234); // Purple color
  doc.text(data.title, 20, yPosition);
  yPosition += 15;

  // Date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, yPosition);
  if (data.month) {
    yPosition += 7;
    doc.text(`Period: ${data.month}`, 20, yPosition);
  }
  yPosition += 15;

  // Summary section
  if (data.summary) {
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text('Summary', 20, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    const summaryData = [
      `Total Employees: ${data.summary.totalEmployees}`,
      `Present Days: ${data.summary.presentDays}`,
      `Absent Days: ${data.summary.absentDays}`,
      `Attendance Rate: ${data.summary.attendanceRate.toFixed(2)}%`,
      `Average Performance Score: ${data.summary.averageScore.toFixed(2)}`,
    ];

    summaryData.forEach((item) => {
      doc.text(item, 20, yPosition);
      yPosition += 6;
    });
    yPosition += 5;
  }

  // Employees table
  if (data.employees && data.employees.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text('Employee Performance', 20, yPosition);
    yPosition += 10;

    // Table headers
    doc.setFontSize(9);
    doc.setFillColor(102, 126, 234);
    doc.setTextColor(255, 255, 255);

    const columnWidths = [25, 25, 20, 15, 15, 15, 15];
    const headers = [
      'Name',
      'Email',
      'Department',
      'Attendance',
      'Hours',
      'Punctuality',
      'Score',
    ];
    let xPosition = 12;

    headers.forEach((header, i) => {
      doc.rect(xPosition, yPosition - 6, columnWidths[i], 8, 'F');
      doc.text(header, xPosition + 2, yPosition);
      xPosition += columnWidths[i];
    });

    yPosition += 10;
    doc.setTextColor(50, 50, 50);

    // Table rows
    data.employees.forEach((employee, idx) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }

      // Alternate row background
      if (idx % 2 === 0) {
        doc.setFillColor(240, 240, 240);
        doc.rect(12, yPosition - 6, pageWidth - 24, 7, 'F');
      }

      xPosition = 12;
      doc.setFontSize(8);
      doc.text(employee.name, xPosition + 1, yPosition);
      xPosition += columnWidths[0];
      doc.text(employee.email || '', xPosition + 1, yPosition);
      xPosition += columnWidths[1];
      doc.text(employee.department, xPosition + 1, yPosition);
      xPosition += columnWidths[2];
      doc.text(
        employee.attendance?.toString() || '-',
        xPosition + 1,
        yPosition
      );
      xPosition += columnWidths[3];
      doc.text(
        employee.hoursWorked?.toString() || '-',
        xPosition + 1,
        yPosition
      );
      xPosition += columnWidths[4];
      doc.text(
        employee.punctuality?.toString() || '-',
        xPosition + 1,
        yPosition
      );
      xPosition += columnWidths[5];
      doc.text(employee.score?.toFixed(2) || '-', xPosition + 1, yPosition);

      yPosition += 7;
    });
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  return Buffer.from(doc.output('arraybuffer'));
}

export function generateExcel(data: ReportData): Buffer {
  const workbook = XLSX.utils.book_new();

  // Summary sheet
  if (data.summary) {
    const summaryData = [
      ['Attendance Report', data.title],
      ['Generated', new Date().toLocaleDateString()],
      ['Period', data.month || ''],
      [],
      ['Summary Metrics'],
      ['Total Employees', data.summary.totalEmployees],
      ['Present Days', data.summary.presentDays],
      ['Absent Days', data.summary.absentDays],
      ['Attendance Rate', `${data.summary.attendanceRate.toFixed(2)}%`],
      ['Average Performance Score', data.summary.averageScore.toFixed(2)],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [{ wch: 25 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  }

  // Employees sheet
  if (data.employees && data.employees.length > 0) {
    const employeeData = [
      ['Name', 'Email', 'Department', 'Attendance', 'Hours', 'Punctuality', 'Score'],
      ...data.employees.map((e) => [
        e.name,
        e.email,
        e.department,
        e.attendance || '',
        e.hoursWorked || '',
        e.punctuality || '',
        e.score ? e.score.toFixed(2) : '',
      ]),
    ];

    const employeeSheet = XLSX.utils.aoa_to_sheet(employeeData);
    employeeSheet['!cols'] = [
      { wch: 20 },
      { wch: 25 },
      { wch: 15 },
      { wch: 12 },
      { wch: 10 },
      { wch: 12 },
      { wch: 10 },
    ];

    // Style header row
    for (let col = 0; col < 7; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
      if (employeeSheet[cellRef]) {
        employeeSheet[cellRef].s = {
          fill: { fgColor: { rgb: 'FF667EEA' } },
          font: { bold: true, color: { rgb: 'FFFFFFFF' } },
        };
      }
    }

    XLSX.utils.book_append_sheet(workbook, employeeSheet, 'Employees');
  }

  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
  return buffer as Buffer;
}
