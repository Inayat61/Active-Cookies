import { promises as fsPromises, createReadStream } from 'fs';
import readline from 'readline';
import logger from './logs/logger';
import {
  validateFilename,
  parseDate,
  validateCsvHeader,
  parseLine,
  isTargetDate,
  extractMostActiveCookies,
  parseArgs
} from './helper';

export async function findMostActiveCookies(filename: string, targetDate: string): Promise<string[]> {
  filename = validateFilename(filename);
  targetDate = parseDate(targetDate);

  try {
    await fsPromises.access(filename);
  } catch {
    throw new Error(`File not found: ${filename}`);
  }

  const frequencyMap = new Map<string, number>();
  const fileStream = createReadStream(filename);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineNumber = 0;
  let headerProcessed = false;

  for await (const line of rl) {
    lineNumber++;
    if (!headerProcessed) {
      validateCsvHeader(line);
      headerProcessed = true;
      continue;
    }

    try {
      const { cookieId, timestamp } = parseLine(line, lineNumber);
      if (isTargetDate(timestamp, targetDate)) {
        frequencyMap.set(cookieId, (frequencyMap.get(cookieId) || 0) + 1);
      }
    } catch (err: any) {
      logger.warn(`Skipping line ${lineNumber}: ${err.message}`);
    }
  }

  logger.info(`Processed ${lineNumber - 1} lines for date ${targetDate}`);
  return extractMostActiveCookies(frequencyMap);
}

export async function main(): Promise<void> {
  try {
    const args = parseArgs(process.argv.slice(2));
    const cookies = await findMostActiveCookies(args.filename, args.date);

    if (cookies.length === 0) {
      logger.warn(`No cookies found for date: ${args.date}`);
    } else {
      logger.info(`Found ${cookies.length} most active cookie(s) for date ${args.date}`);
      cookies.forEach(cookie => console.log(cookie));
    }
  } catch (err: any) {
    logger.error(err.message);
    process.exit(1);
  }
}

// Only run main if this file is executed directly (not imported)
if (require.main === module && !process.env.JEST_WORKER_ID) {
  main();
}