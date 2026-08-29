export type SearchType = 'studentNumber' | 'email' | 'name';

export interface ColumnDefinition {
  originalKey: string;
  normalizedKey: string;
  displayName: string;
  isPrimaryId?: boolean;
  isName?: boolean;
  isEmail?: boolean;
  isPassword?: boolean;
}

export interface NormalizedStudentRecord {
  id: string; // Unique row ID
  raw: Record<string, any>;
  studentNumber: string;
  name: string;
  email: string;
  altEmail?: string;
  phone?: string;
  altPhone?: string;
  password?: string;
  className?: string;
  section?: string;
  rollNo?: string;
  status?: string;
  courseStatus?: string;
  allFields: {
    key: string;
    label: string;
    value: string;
  }[];
}

export interface SuggestionItem {
  id: string;
  matchedText: string;
  fullTitle: string;
  subtitle: string;
  badge?: string;
  record: NormalizedStudentRecord;
}

export interface SearchValidationResult {
  isValid: boolean;
  message?: string;
}

export interface DatabaseMetadata {
  fileName: string;
  sheetName: string;
  rowCount: number;
  columns: string[];
  loadedAt: Date;
}
