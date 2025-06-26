import { findMostActiveCookies } from '../index';
import { promises as fs } from 'fs';
import path from 'path';
import { main } from '../index';

const testFile: string = path.join(process.cwd(), 'test_cookie_log.csv');

beforeAll(async () => {
  const content = `cookie,timestamp
abc,2021-12-09T14:19:00+00:00
xyz,2021-12-09T10:13:00+00:00
abc,2021-12-09T16:00:00+00:00
def,2021-12-08T15:00:00+00:00
xyz,2021-12-10T14:19:00+00:00
`;
  await fs.writeFile(testFile, content);
});

afterAll(async () => {
  await fs.unlink(testFile);
});

describe('findMostActiveCookies', () => {
  it('should return most active cookie(s) for a given date', async () => {
    const result = await findMostActiveCookies(testFile, '2021-12-09');
    expect(result).toEqual(['abc']);
  });

  it('should return multiple cookies if tied in frequency', async () => {
    const tiedContent = `cookie,timestamp
a,2021-12-11T10:00:00+00:00
b,2021-12-11T11:00:00+00:00
a,2021-12-11T12:00:00+00:00
b,2021-12-11T13:00:00+00:00
`;
    const tiedFile = path.join(process.cwd(), 'tie.csv');
    await fs.writeFile(tiedFile, tiedContent);

    const result = await findMostActiveCookies(tiedFile, '2021-12-11');
    expect(result).toEqual(['a', 'b']);

    await fs.unlink(tiedFile);
  });

  it('should return empty array for no matching date', async () => {
    const result = await findMostActiveCookies(testFile, '1999-01-01');
    expect(result).toEqual([]);
  });

  it('should throw on non-existent file', async () => {
    await expect(findMostActiveCookies('nonexistent.csv', '2021-12-09')).rejects.toThrow();
  });

  it('should throw on invalid date format', async () => {
    await expect(findMostActiveCookies(testFile, '12-09-2021')).rejects.toThrow('Invalid date format');
  });

  it('should throw on invalid CSV header', async () => {
    const badFile = path.join(process.cwd(), 'bad.csv');
    const content = `id,time\nabc,2021-12-09T14:00:00+00:00`;
    await fs.writeFile(badFile, content);

    await expect(findMostActiveCookies(badFile, '2021-12-09')).rejects.toThrow('Invalid CSV header');
    await fs.unlink(badFile);
  });

  it('should handle malformed lines gracefully', async () => {
    const malformedFile = path.join(process.cwd(), 'malformed.csv');
    const content = `cookie,timestamp
abc,2021-12-09T14:19:00+00:00
xyz,2021-12-09T10:13:00+00:00,extra_column
abc,2021-12-09T16:00:00+00:00
,2021-12-09T17:00:00+00:00
def,
`;
    await fs.writeFile(malformedFile, content);

    const result = await findMostActiveCookies(malformedFile, '2021-12-09');
    expect(result).toEqual(['abc']);

    await fs.unlink(malformedFile);
  });

  it('should handle empty file after header', async () => {
    const emptyFile = path.join(process.cwd(), 'empty.csv');
    const content = `cookie,timestamp
`;
    await fs.writeFile(emptyFile, content);

    const result = await findMostActiveCookies(emptyFile, '2021-12-09');
    expect(result).toEqual([]);

    await fs.unlink(emptyFile);
  });
});
describe('main function', () => {
  const testFile = path.join(process.cwd(), 'main_test.csv');
  const originalArgv = process.argv;

  beforeAll(async () => {
    const content = `cookie,timestamp
abc,2021-12-09T10:00:00+00:00
abc,2021-12-09T11:00:00+00:00
xyz,2021-12-09T12:00:00+00:00
`;
    await fs.writeFile(testFile, content);
  });

  afterAll(async () => {
    await fs.unlink(testFile);
    process.argv = originalArgv;
  });

  it('should print most active cookies from CLI args', async () => {
    process.argv = ['node', 'script', '-f', testFile, '-d', '2021-12-09'];

    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await main();

    expect(logSpy).toHaveBeenCalledWith('abc');
    logSpy.mockRestore();
    infoSpy.mockRestore();
    errorSpy.mockRestore();
  });
});