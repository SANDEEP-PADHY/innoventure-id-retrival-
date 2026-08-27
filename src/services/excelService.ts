import * as XLSX from 'xlsx';
import { NormalizedStudentRecord, DatabaseMetadata } from '../types/student';

// Hardcoded static Excel database path
export const HARDCODED_EXCEL_PATH = '/assets/students.xlsx';

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
      ck === 'studentnumber' ||
      ck === 'studentno' ||
      ck === 'studentid' ||
      ck === 'innoventureid' ||
      ck === 'enrollmentno' ||
      ck === 'admissionno' ||
      ck === 'id'
    );
  });

  let nameCol = allColumnKeys.find((k) => {
    const ck = cleanKey(k);
    return ck === 'name' || ck === 'studentname' || ck === 'fullname' || ck === 'candidatename';
  });

  let emailCol = allColumnKeys.find((k) => {
    const ck = cleanKey(k);
    return (
      ck === 'email' ||
      ck === 'emailid' ||
      ck === 'studentemail' ||
      ck === 'emailaddress' ||
      ck === 'mail'
    );
  });

  let passwordCol = allColumnKeys.find((k) => {
    const ck = cleanKey(k);
    return ck === 'password' || ck === 'pass' || ck === 'pwd' || ck === 'studentpassword';
  });

  let classCol = allColumnKeys.find((k) => {
    const ck = cleanKey(k);
    return ck === 'class' || ck === 'grade' || ck === 'standard' || ck === 'std';
  });

  let sectionCol = allColumnKeys.find((k) => {
    const ck = cleanKey(k);
    return ck === 'section' || ck === 'sec' || ck === 'division' || ck === 'div';
  });

  let rollNoCol = allColumnKeys.find((k) => {
    const ck = cleanKey(k);
    return (
      ck === 'rollno' ||
      ck === 'rollnumber' ||
      ck === 'sno' ||
      ck === 'serialno'
    );
  });

  // Fallbacks if not detected by strict keywords
  if (!idCol && allColumnKeys.length > 0) idCol = allColumnKeys[0];
  if (!nameCol && allColumnKeys.length > 1) nameCol = allColumnKeys[1];
  if (!emailCol && allColumnKeys.length > 2) emailCol = allColumnKeys[2];

  const records: NormalizedStudentRecord[] = [];

  rawRows.forEach((row, index) => {
    // Check if row is completely empty
    const hasData = Object.values(row).some((val) => formatCellValue(val) !== '');
    if (!hasData) return;

    const studentNumber = idCol ? formatCellValue(row[idCol]) : `STU-${index + 1}`;
    const name = nameCol ? formatCellValue(row[nameCol]) : `Student ${index + 1}`;
    const email = emailCol ? formatCellValue(row[emailCol]) : '';
    const password = passwordCol ? formatCellValue(row[passwordCol]) : undefined;
    const className = classCol ? formatCellValue(row[classCol]) : undefined;
    const section = sectionCol ? formatCellValue(row[sectionCol]) : undefined;
    const rollNo = rollNoCol ? formatCellValue(row[rollNoCol]) : undefined;

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
      password,
      className,
      section,
      rollNo,
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
 * Loads the hardcoded student database directly from /assets/students.xlsx
 */
export async function loadHardcodedExcelDatabase(): Promise<{
  records: NormalizedStudentRecord[];
  metadata: DatabaseMetadata;
}> {
  try {
    const response = await fetch(HARDCODED_EXCEL_PATH);
    if (response.ok) {
      const buffer = await response.arrayBuffer();
      return parseExcelBuffer(buffer, 'students.xlsx');
    }
  } catch (err) {
    // try fallback candidate if needed
  }

  // Secondary internal fallback if students.xlsx is not reachable
  const fallbackResponse = await fetch('/assets/Students_AllGrades_2026-08-27.xlsx');
  if (fallbackResponse.ok) {
    const buffer = await fallbackResponse.arrayBuffer();
    return parseExcelBuffer(buffer, 'students.xlsx');
  }

  throw new Error('Unable to load student database from /assets/ folder.');
}
