/**
 * Sanitizes a string to prevent CSV / Spreadsheet formula injection (CWE-1236).
 * Any cell starting with '=', '+', '-', '@', '\t', or '\r' is escaped with a leading single quote.
 */
export function sanitizeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }

  let str = String(value);

  // If cell starts with formula indicators, prefix with single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // If cell contains commas, quotes, or line breaks, enclose in quotes and escape internal quotes
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Builds a valid RFC 4180 CSV string from headers and rows with formula injection safety.
 */
export function buildSafeCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const headerLine = headers.map(sanitizeCsvCell).join(",");
  const dataLines = rows.map((row) => row.map(sanitizeCsvCell).join(","));
  return [headerLine, ...dataLines].join("\r\n");
}
