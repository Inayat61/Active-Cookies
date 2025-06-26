import {
  validateFilename,
  parseDate,
  validateCsvHeader,
  parseLine,
  isTargetDate,
  extractMostActiveCookies,
  parseArgs
} from '../helper';

describe('Helper Functions', () => {
  describe('validateFilename', () => {
    it('should return trimmed filename for valid input', () => {
      expect(validateFilename('  test.csv  ')).toBe('test.csv');
    });

    it('should throw for empty or invalid filenames', () => {
      expect(() => validateFilename('')).toThrow();
      expect(() => validateFilename('   ')).toThrow();
      expect(() => validateFilename(null as any)).toThrow();
    });
  });

  describe('parseDate', () => {
    it('should return valid date string', () => {
      expect(parseDate('2021-12-09')).toBe('2021-12-09');
    });

    it('should throw for invalid date formats', () => {
      expect(() => parseDate('12-09-2021')).toThrow();
      expect(() => parseDate('2021/12/09')).toThrow();
      expect(() => parseDate('invalid')).toThrow();
    });
  });

  describe('validateCsvHeader', () => {
    it('should pass for correct header', () => {
      expect(() => validateCsvHeader('cookie,timestamp')).not.toThrow();
    });

    it('should throw for incorrect header', () => {
      expect(() => validateCsvHeader('id,time')).toThrow();
    });
  });

  describe('parseLine', () => {
    it('should parse valid line', () => {
      const result = parseLine('abc,2021-12-09T10:00:00+00:00', 1);
      expect(result).toEqual({
        cookieId: 'abc',
        timestamp: '2021-12-09T10:00:00+00:00'
      });
    });

    it('should throw for invalid line format', () => {
      expect(() => parseLine('abc', 1)).toThrow();
      expect(() => parseLine('abc,timestamp,extra', 1)).toThrow();
      expect(() => parseLine(',2021-12-09T10:00:00+00:00', 1)).toThrow();
    });
  });

  describe('isTargetDate', () => {
    it('should return true for matching date', () => {
      expect(isTargetDate('2021-12-09T10:00:00+00:00', '2021-12-09')).toBe(true);
    });

    it('should return false for non-matching date', () => {
      expect(isTargetDate('2021-12-08T10:00:00+00:00', '2021-12-09')).toBe(false);
    });
  });

  describe('extractMostActiveCookies', () => {
    it('should return cookies with highest frequency', () => {
      const map = new Map([
        ['a', 3],
        ['b', 1],
        ['c', 3]
      ]);
      expect(extractMostActiveCookies(map)).toEqual(['a', 'c']);
    });

    it('should return empty array for empty map', () => {
      expect(extractMostActiveCookies(new Map())).toEqual([]);
    });
  });

  describe('parseArgs', () => {
    it('should parse correct args', () => {
      const args = ['-f', 'cookies.csv', '-d', '2021-12-09'];
      const result = parseArgs(args);
      expect(result).toEqual({ filename: 'cookies.csv', date: '2021-12-09' });
    });

    it('should throw on missing args', () => {
      expect(() => parseArgs(['-f', 'file.csv'])).toThrow();
    });

    it('should throw on unknown args', () => {
      expect(() => parseArgs(['-x', 'abc', '-d', '2021-12-09'])).toThrow();
    });
  });
});