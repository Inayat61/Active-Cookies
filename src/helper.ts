import { ParsedLine, ParsedArgs } from './types';
import logger from './logs/logger';

export function validateFilename(filename: string): string {
  if (!filename || typeof filename !== 'string' || filename.trim() === '') {
    throw new Error('Filename cannot be null, undefined, or empty');
  }
  return filename.trim();
}

export function parseDate(dateString: string): string {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateString || !dateRegex.test(dateString)) {
    throw new Error(`Invalid date format: ${dateString}. Expected format: YYYY-MM-DD`);
  }

  const date = new Date(`${dateString}T00:00:00Z`);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateString}`);
  }

  return dateString;
}

export function validateCsvHeader(headerLine: string): void {
  const expected = 'cookie,timestamp';
  if (headerLine !== expected) {
    throw new Error(`Invalid CSV header. Expected: '${expected}', got: '${headerLine}'`);
  }
}

export function parseLine(line: string, lineNumber: number): ParsedLine {
  const parts = line.split(',');
  if (parts.length !== 2) {
    throw new Error(`Invalid format at line ${lineNumber}: expected 2 columns`);
  }

  const cookieId = parts[0].trim();
  const timestamp = parts[1].trim();

  if (!cookieId) throw new Error(`Empty cookie ID at line ${lineNumber}`);
  if (!timestamp) throw new Error(`Empty timestamp at line ${lineNumber}`);

  return { cookieId, timestamp };
}

export function isTargetDate(timestamp: string, targetDate: string): boolean {
  try {
    return timestamp.substring(0, 10) === targetDate;
  } catch (err) {
    logger.warn(`Invalid timestamp: ${timestamp}`);
    return false;
  }
}

export function extractMostActiveCookies(frequencyMap: Map<string, number>): string[] {
  if (frequencyMap.size === 0) return [];

  const max = Math.max(...frequencyMap.values());
  return [...frequencyMap.entries()]
    .filter(([_, freq]) => freq === max)
    .map(([id]) => id)
    .sort();
}

export function parseArgs(args: string[]): ParsedArgs {
  if (args.length !== 4) {
    throw new Error('Usage: npm start -- -f <filename> -d <date>');
  }

  const result: Partial<ParsedArgs> = {};
  for (let i = 0; i < args.length; i += 2) {
    if (args[i] === '-f') result.filename = args[i + 1];
    else if (args[i] === '-d') result.date = args[i + 1];
    else throw new Error(`Unknown parameter: ${args[i]}`);
  }

  if (!result.filename || !result.date) {
    throw new Error('Both -f and -d parameters are required');
  }

  return result as ParsedArgs;
}