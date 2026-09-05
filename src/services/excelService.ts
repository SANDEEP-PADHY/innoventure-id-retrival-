import * as XLSX from 'xlsx';
import { NormalizedStudentRecord, DatabaseMetadata } from '../types/student';

// Hardcoded static Excel database path
export const HARDCODED_EXCEL_PATH = new URL('../../assets/db.xlsx', import.meta.url).href;

/**
 * Normalizes a column name for fuzzy key detection (e.g. "Student Name" -> "studentname")
 */
function cleanKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Safely format an Excel cell value to string preserving exact formatting
 */
export function formatCellValue(value: any): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') {
    if (Number.isInteger(value)) {
      return value.toString();
    }
    return value.toString();
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (value instanceof Date) {
    return value.toLocaleDateString();
  }
  return String(value).trim();
}

/**
 * Parses an Excel ArrayBuffer into normalized student records
 */
export function parseExcelBuffer(
  buffer: ArrayBuffer,
  fileName: string = 'students.xlsx'
): { records: NormalizedStudentRecord[]; metadata: DatabaseMetadata } {
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  
  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('The Excel workbook contains no worksheets.');
  }

  // Always read the first worksheet as specified in requirements
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  if (!worksheet) {
    throw new Error(`Unable to read worksheet: "${firstSheetName}"`);
  }

  // Convert worksheet to array of objects with first row as headers
  const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
    defval: '',
    raw: false,
  });

  if (!rawRows || rawRows.length === 0) {
    return {
      records: [],
      metadata: {
        fileName,
        sheetName: firstSheetName,
        rowCount: 0,
        columns: [],
        loadedAt: new Date(),
      },
    };
  }

  // Extract all distinct column keys from the raw rows
  const columnKeySet = new Set<string>();
  rawRows.forEach((row) => {
    Object.keys(row).forEach((k) => columnKeySet.add(k));
  });
  const allColumnKeys = Array.from(columnKeySet);

  // Identify column roles dynamically
  let idCol = allColumnKeys.find((k) => {
    const ck = cleanKey(k);
    return (
      ck === 'innovid' ||
      ck === 'innoventureid' ||
      ck === 'studentnumber' ||
      ck === 'studentno' ||
      ck === 'studentid' ||
      ck === 'enrollmentno' ||
      ck === 'admissionno' ||
      ck === 'id' ||
      (ck.includes('innov') && ck.includes('id')) ||
      (ck.includes('student') && ck.includes('id'))
    );
  });

  let nameCol = allColumnKeys.find((k) => {
    const ck = cleanKey(k);
    return (
      ck === 'studentname' ||
      ck === 'name' ||
      ck === 'fullname' ||
      ck === 'candidatename' ||
      ck === 'student'
    );
  });

  let emailCol = allColumnKeys.find((k) => {
    const ck = cleanKey(k);
    return (
      ck === 'primaryemail' ||
      ck === 'email' ||
      ck === 'emailid' ||
      ck === 'studentemail' ||
      ck === 'emailaddress' ||
      ck === 'mail'
    );
  });

  let altEmailCol = allColumnKeys.find((k) => {
    const ck = cleanKey(k);
    return ck === 'altemail' || ck === 'alternateemail' || ck === 'secondaryemail';
  });

  let phoneCol = allColumnKeys.find((k) => {
    const ck = cleanKey(k);
    return (
      ck === 'primarycontact' ||
      ck === 'phone' ||
      ck === 'contact' ||
      ck === 'mobile' ||
      ck === 'phonenumber' ||
      ck === 'contactnumber' ||
      ck === 'mobilenumber'
    );
  });

  let altPhoneCol = allColumnKeys.find((k) => {
    const ck = cleanKey(k);
    return (
      ck === 'altcontact' ||
      ck === 'alternatecontact' ||
      ck === 'altphone' ||
      ck === 'secondarycontact'
    );
  });

  let passwordCol = allColumnKeys.find((k) => {
    const ck = cleanKey(k);
    return ck === 'password' || ck === 'pass' || ck === 'pwd' || ck === 'studentpassword';
  });

  let classCol = allColumnKeys.find((k) => {
    const ck = cleanKey(k);
    return ck === 'grade' || ck === 'class' || ck === 'standard' || ck === 'std';
  });

  let sectionCol = allColumnKeys.find((k) => {
    const ck = cleanKey(k);
    return ck === 'section' || ck === 'sec' || ck === 'division' || ck === 'div';
  });

  let rollNoCol = allColumnKeys.find((k) => {
    const ck = cleanKey(k);
    return (
      ck === 'sr' ||
      ck === 'srno' ||
      ck === 'rollno' ||
      ck === 'rollnumber' ||
      ck === 'sno' ||
      ck === 'serialno'
    );
  });

  let statusCol = allColumnKeys.find((k) => {
    const ck = cleanKey(k);
    return ck === 'status' || ck === 'account' || ck === 'activated';
  });

  let courseStatusCol = allColumnKeys.find((k) => {
    const ck = cleanKey(k);
    return (
      ck === 'coursestatus' ||
      ck === 'course' ||
      ck === 'coursecompleted' ||
      (ck.includes('course') && ck.includes('completed'))
    );
  });

  // Fallbacks if not detected by strict keywords
  if (!idCol && allColumnKeys.length > 0) idCol = allColumnKeys.find((k) => cleanKey(k).includes('id')) || allColumnKeys[0];
  if (!nameCol && allColumnKeys.length > 1) nameCol = allColumnKeys.find((k) => cleanKey(k).includes('name')) || allColumnKeys[1];
  if (!emailCol && allColumnKeys.length > 2) emailCol = allColumnKeys.find((k) => cleanKey(k).includes('email') || cleanKey(k).includes('mail')) || allColumnKeys[2];

  const records: NormalizedStudentRecord[] = [];

  rawRows.forEach((row, index) => {
    // Check if row is completely empty
    const hasData = Object.values(row).some((val) => formatCellValue(val) !== '');
    if (!hasData) return;

    const studentNumber = idCol ? formatCellValue(row[idCol]) : `STU-${index + 1}`;
    const name = nameCol ? formatCellValue(row[nameCol]) : `Student ${index + 1}`;
    const email = emailCol ? formatCellValue(row[emailCol]) : '';
    const altEmail = altEmailCol ? formatCellValue(row[altEmailCol]) : undefined;
    const phone = phoneCol ? formatCellValue(row[phoneCol]) : undefined;
    const altPhone = altPhoneCol ? formatCellValue(row[altPhoneCol]) : undefined;
    const password = passwordCol ? formatCellValue(row[passwordCol]) : undefined;
    const className = classCol ? formatCellValue(row[classCol]) : undefined;
    const section = sectionCol ? formatCellValue(row[sectionCol]) : undefined;
    const rollNo = rollNoCol ? formatCellValue(row[rollNoCol]) : undefined;
    const status = statusCol ? formatCellValue(row[statusCol]) : undefined;
    const rawCourseStatus = courseStatusCol
      ? formatCellValue(row[courseStatusCol])
      : undefined;
    const normalizedCourseStatus = rawCourseStatus?.toLowerCase();
    const normalizedAccountStatus = status?.toLowerCase();
    const courseStatus =
      normalizedCourseStatus === 'yes' || normalizedCourseStatus?.includes('completed')
        ? 'Completed'
        : normalizedAccountStatus === 'yes' || normalizedAccountStatus === 'active'
          ? 'In Progress'
          : normalizedCourseStatus === 'no'
            ? 'Not Enrolled'
          : rawCourseStatus;

    // Dynamically build all fields preserving the exact column names
    const allFields = allColumnKeys.map((colKey) => ({
      key: colKey,
      label: colKey,
      value: formatCellValue(row[colKey]),
    }));

    records.push({
      id: `row-${index}-${studentNumber || index}`,
      raw: row,
      studentNumber,
      name,
      email,
      altEmail,
      phone,
      altPhone,
      password,
      className,
      section,
      rollNo,
      status,
      courseStatus,
      allFields,
    });
  });

  return {
    records,
    metadata: {
      fileName,
      sheetName: firstSheetName,
      rowCount: records.length,
      columns: allColumnKeys,
      loadedAt: new Date(),
    },
  };
}

/**
 * Loads the hardcoded student database directly from /assets/db.xlsx
 */
export async function loadHardcodedExcelDatabase(): Promise<{
  records: NormalizedStudentRecord[];
  metadata: DatabaseMetadata;
}> {
  const candidatePaths = [
    HARDCODED_EXCEL_PATH,
    '/assets/students.xlsx',
    '/assets/students-2026-08-29.xlsx',
    '/assets/Students_AllGrades_2026-08-27.xlsx',
  ];

  for (const path of candidatePaths) {
    try {
      const response = await fetch(path);
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        const fileName = path.split('/').pop() || 'students.xlsx';
        return parseExcelBuffer(buffer, fileName);
      }
    } catch (err) {
      // try next candidate
    }
  }

  throw new Error('Unable to load student database from /assets/ folder.');
}
