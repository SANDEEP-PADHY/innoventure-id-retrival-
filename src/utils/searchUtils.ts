import { SearchType, NormalizedStudentRecord, SuggestionItem, SearchValidationResult } from '../types/student';

/**
 * Validates input based on the active search type
 */
export function validateSearchInput(
  value: string,
  searchType: SearchType,
  isAlphanumericIdSupported: boolean = false
): SearchValidationResult {
  const trimmed = value.trim();

  if (!trimmed) {
    return { isValid: false, message: 'Please enter a search term.' };
  }

  if (searchType === 'studentNumber') {
    if (!isAlphanumericIdSupported) {
      if (!/^\d+$/.test(trimmed)) {
        return { isValid: false, message: 'Student number must contain digits only.' };
      }
      if (trimmed.length < 10) {
        return {
          isValid: false,
          message: `Enter ${10 - trimmed.length} more digit${10 - trimmed.length > 1 ? 's' : ''} (10 digits required).`,
        };
      }
      if (trimmed.length > 10) {
        return { isValid: false, message: 'Student number cannot exceed 10 digits.' };
      }
      return { isValid: true };
    } else {
      if (trimmed.length < 2) {
        return { isValid: false, message: 'Please enter at least 2 characters.' };
      }
      return { isValid: true };
    }
  }

  if (searchType === 'email') {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmed)) {
      return { isValid: false, message: 'Please enter a valid email address (e.g., student@example.com).' };
    }
    return { isValid: true };
  }

  if (searchType === 'name') {
    if (trimmed.length < 2) {
      return { isValid: false, message: 'Please enter at least 2 characters of the name.' };
    }
    return { isValid: true };
  }

  return { isValid: true };
}

/**
 * Sanitizes input keystrokes as the user types based on the search type
 */
export function filterInputCharacters(
  value: string,
  searchType: SearchType,
  isAlphanumericIdSupported: boolean = false
): string {
  if (searchType === 'studentNumber') {
    if (!isAlphanumericIdSupported) {
      const digitsOnly = value.replace(/\D/g, '');
      return digitsOnly.slice(0, 10);
    } else {
      // Allow alphanumeric and hyphens for custom IDs like GJ-006175
      return value.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 20);
    }
  }
  return value;
}

/**
 * Searches the student database and returns matching records
 */
export function executeSearch(
  query: string,
  searchType: SearchType,
  records: NormalizedStudentRecord[],
  isAlphanumericIdSupported: boolean = false
): { matches: NormalizedStudentRecord[]; validation: SearchValidationResult } {
  const trimmed = query.trim();
  const validation = validateSearchInput(trimmed, searchType, isAlphanumericIdSupported);

  if (!validation.isValid) {
    return { matches: [], validation };
  }

  if (searchType === 'studentNumber') {
    const cleanQuery = trimmed.toLowerCase();
    const cleanDigitsOrAlpha = cleanQuery.replace(/[^a-z0-9]/g, '');
    // Allow exact match or matching ID without prefix (e.g. searching 006175 matches GJ-006175)
    const exactMatches = records.filter((rec) => {
      const num = rec.studentNumber.trim().toLowerCase();
      const numClean = num.replace(/[^a-z0-9]/g, '');
      return (
        num === cleanQuery ||
        numClean === cleanDigitsOrAlpha ||
        (cleanDigitsOrAlpha.length >= 4 && numClean.endsWith(cleanDigitsOrAlpha))
      );
    });
    return { matches: exactMatches, validation };
  }

  if (searchType === 'email') {
    const cleanQuery = trimmed.toLowerCase();
    const exactMatches = records.filter(
      (rec) =>
        rec.email.trim().toLowerCase() === cleanQuery ||
        (rec.altEmail && rec.altEmail.trim().toLowerCase() === cleanQuery)
    );
    return { matches: exactMatches, validation };
  }

  if (searchType === 'name') {
    const cleanQuery = trimmed.toLowerCase();
    
    const exact: NormalizedStudentRecord[] = [];
    const startsWith: NormalizedStudentRecord[] = [];
    const wordStarts: NormalizedStudentRecord[] = [];
    const contains: NormalizedStudentRecord[] = [];

    records.forEach((rec) => {
      const name = rec.name.trim().toLowerCase();
      if (!name) return;

      if (name === cleanQuery) {
        exact.push(rec);
      } else if (name.startsWith(cleanQuery)) {
        startsWith.push(rec);
      } else {
        const words = name.split(/\s+/);
        if (words.some((w) => w.startsWith(cleanQuery))) {
          wordStarts.push(rec);
        } else if (name.includes(cleanQuery)) {
          contains.push(rec);
        }
      }
    });

    const matches = [...exact, ...startsWith, ...wordStarts, ...contains];
    return { matches, validation };
  }

  return { matches: [], validation: { isValid: false, message: 'Invalid search mode' } };
}

/**
 * Generates live autocomplete suggestions for the given input query
 */
export function getLiveSuggestions(
  query: string,
  searchType: SearchType,
  records: NormalizedStudentRecord[],
  maxSuggestions: number = 7
): SuggestionItem[] {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length === 0) return [];

  const lowerQuery = trimmed.toLowerCase();
  const suggestionMap = new Map<string, SuggestionItem>();

  if (searchType === 'studentNumber') {
    const cleanQuery = trimmed.toLowerCase();
    const cleanDigits = cleanQuery.replace(/[^a-z0-9]/g, '');
    const exactMatches: NormalizedStudentRecord[] = [];
    const prefixMatches: NormalizedStudentRecord[] = [];
    const containsMatches: NormalizedStudentRecord[] = [];

    records.forEach((rec) => {
      const num = rec.studentNumber.trim().toLowerCase();
      const numClean = num.replace(/[^a-z0-9]/g, '');
      if (!num) return;

      if (num === cleanQuery || numClean === cleanDigits) {
        exactMatches.push(rec);
      } else if (num.startsWith(cleanQuery) || numClean.startsWith(cleanDigits)) {
        prefixMatches.push(rec);
      } else if (num.includes(cleanQuery) || numClean.includes(cleanDigits)) {
        containsMatches.push(rec);
      }
    });

    const ordered = [...exactMatches, ...prefixMatches, ...containsMatches];
    
    for (const rec of ordered) {
      if (suggestionMap.has(rec.studentNumber)) continue;
      
      const classInfo = [rec.className ? `Grade ${rec.className}` : '', rec.section ? `Sec ${rec.section}` : '', rec.rollNo ? `Sr ${rec.rollNo}` : '']
        .filter(Boolean)
        .join(' | ');

      suggestionMap.set(rec.studentNumber, {
        id: rec.id,
        matchedText: rec.studentNumber,
        fullTitle: rec.studentNumber,
        subtitle: `${rec.name}${classInfo ? ` • ${classInfo}` : ''}`,
        badge: rec.className ? `Grade ${rec.className}` : undefined,
        record: rec,
      });

      if (suggestionMap.size >= maxSuggestions) break;
    }
  } else if (searchType === 'email') {
    const cleanQuery = trimmed.toLowerCase();
    const exactMatches: { rec: NormalizedStudentRecord; em: string }[] = [];
    const prefixMatches: { rec: NormalizedStudentRecord; em: string }[] = [];
    const domainMatches: { rec: NormalizedStudentRecord; em: string }[] = [];

    records.forEach((rec) => {
      const emails = [rec.email, rec.altEmail].filter(Boolean) as string[];
      
      for (const rawEmail of emails) {
        const email = rawEmail.trim().toLowerCase();
        if (!email) continue;

        if (email === cleanQuery) {
          exactMatches.push({ rec, em: rawEmail });
        } else if (email.startsWith(cleanQuery)) {
          prefixMatches.push({ rec, em: rawEmail });
        } else if (email.includes(cleanQuery)) {
          domainMatches.push({ rec, em: rawEmail });
        }
      }
    });

    const ordered = [...exactMatches, ...prefixMatches, ...domainMatches];

    for (const item of ordered) {
      const key = `${item.em.toLowerCase()}-${item.rec.id}`;
      if (suggestionMap.has(key)) continue;

      suggestionMap.set(key, {
        id: item.rec.id,
        matchedText: item.em,
        fullTitle: item.em,
        subtitle: `${item.rec.name} (${item.rec.studentNumber})`,
        badge: item.rec.className ? `Grade ${item.rec.className}` : undefined,
        record: item.rec,
      });

      if (suggestionMap.size >= maxSuggestions) break;
    }
  } else if (searchType === 'name') {
    const exactMatches: NormalizedStudentRecord[] = [];
    const startsWithMatches: NormalizedStudentRecord[] = [];
    const wordStartsMatches: NormalizedStudentRecord[] = [];
    const containsMatches: NormalizedStudentRecord[] = [];

    records.forEach((rec) => {
      const name = rec.name.trim().toLowerCase();
      if (!name) return;

      if (name === lowerQuery) {
        exactMatches.push(rec);
      } else if (name.startsWith(lowerQuery)) {
        startsWithMatches.push(rec);
      } else {
        const words = name.split(/\s+/);
        if (words.some((w) => w.startsWith(lowerQuery))) {
          wordStartsMatches.push(rec);
        } else if (name.includes(lowerQuery)) {
          containsMatches.push(rec);
        }
      }
    });

    const ordered = [
      ...exactMatches,
      ...startsWithMatches,
      ...wordStartsMatches,
      ...containsMatches,
    ];

    for (const rec of ordered) {
      const uniqueKey = `${rec.name}-${rec.studentNumber}`;
      if (suggestionMap.has(uniqueKey)) continue;

      const classInfo = [rec.className ? `Class ${rec.className}` : '', rec.section ? `Sec ${rec.section}` : '']
        .filter(Boolean)
        .join(' ');

      suggestionMap.set(uniqueKey, {
        id: rec.id,
        matchedText: rec.name,
        fullTitle: rec.name,
        subtitle: `ID: ${rec.studentNumber}${rec.email ? ` • ${rec.email}` : ''}`,
        badge: classInfo || undefined,
        record: rec,
      });

      if (suggestionMap.size >= maxSuggestions) break;
    }
  }

  return Array.from(suggestionMap.values());
}
