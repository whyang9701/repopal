/* eslint-disable vitest/no-commented-out-tests */
import { describe, it, expect } from 'vitest';
import { getFilesFromDirectory, getFiles, getRecentModifiedFiles } from '../../src/file.js'
import path from 'path';
import os from 'os';
import fs from 'fs';
describe("read files", () => {

  it('gets files from directory', async () => {
    const includePatterns = ['**/*']
    const excludePatterns = []
    const currentWorkingDirectory = process.cwd()
    const filePathArray = await getFilesFromDirectory(currentWorkingDirectory, includePatterns, excludePatterns)
    expect(filePathArray.includes('README.md')).toBe(true)
    expect(filePathArray.includes('src/main.ts')).toBe(true)
    expect(filePathArray.filter((filePath) => { return filePath.includes('.ts') }).length).toBeGreaterThan(6)
  });

  it('gets only ts files from directory', async () => {
    const includePatterns = ['**/*.ts']
    const excludePatterns = []
    const currentWorkingDirectory = process.cwd()
    const filePathArray = await getFilesFromDirectory(currentWorkingDirectory, includePatterns, excludePatterns)
    expect(filePathArray.includes('README.md')).toBe(false)
    expect(filePathArray.includes('src/main.ts')).toBe(true)
    expect(filePathArray.filter((filePath) => { return filePath.includes('.ts') }).length).toBeGreaterThan(6)
  });

  it('get only test.ts files from directory', async () => {
    const includePatterns = ['**/*.test.ts']
    const excludePatterns = []
    const currentWorkingDirectory = process.cwd()
    const filePathArray = await getFilesFromDirectory(currentWorkingDirectory, includePatterns, excludePatterns)
    expect(filePathArray.includes('README.md')).toBe(false)
    expect(filePathArray.includes('src/main.ts')).toBe(false)
    expect(filePathArray.filter((filePath) => { return filePath.includes('test.ts') }).length).toBeGreaterThan(0)
  });


  it('gets files from directory exclude tests sub directory', async () => {
    const includePatterns = ['**/*']
    const excludePatterns = ['__tests__/**']
    const currentWorkingDirectory = process.cwd()
    const filePathArray = await getFilesFromDirectory(currentWorkingDirectory, includePatterns, excludePatterns)
    expect(filePathArray.includes('README.md')).toBe(true)
    expect(filePathArray.includes('src/main.ts')).toBe(true)
    expect(filePathArray.filter((filePath) => { return filePath.includes('test.ts') })).toHaveLength(0)
  });

  it('get single file', async () => {
    const filePathArray = await getFiles(["src/main.ts"])
    expect(filePathArray.includes('README.md')).toBe(false)
    expect(filePathArray.includes('src/main.ts')).toBe(true)
  });

  it('get multiple files', async () => {
    const filePathArray = await getFiles(["src/main.ts", "src/file.ts", "src/git.ts"])
    expect(filePathArray.includes('README.md')).toBe(false)
    expect(filePathArray.includes('src/main.ts')).toBe(true)
    expect(filePathArray.includes('src/file.ts')).toBe(true)
    expect(filePathArray.includes('src/git.ts')).toBe(true)
  });

  it('filter recent modified files', async () => {
    // create a test file and modify its timestamp
    const tempFilePath: string = (await createTempFile('test_recent.txt')) as string
    let filePathArray = [tempFilePath]
    filePathArray = getRecentModifiedFiles('/', filePathArray, 1)
    expect(filePathArray.includes((tempFilePath))).toBe(true)

    filePathArray = ['LICENSE']
    filePathArray = getRecentModifiedFiles(process.cwd(), filePathArray, 1)
    expect(filePathArray.includes(('LICENSE'))).toBe(false)

    filePathArray = ['LICENSE']
    filePathArray = getRecentModifiedFiles(process.cwd(), filePathArray, 365)
    expect(filePathArray.includes(('LICENSE'))).toBe(true)
  });

});


async function createTempFile(data, prefix = 'temp-file-', suffix = '.txt') {
  try {
    // Get the system's temporary directory
    const tempDir = os.tmpdir();

    // Create a unique temporary file path
    const tempFilePath = await new Promise<string>((resolve, reject) => {
      fs.mkdtemp(path.join(tempDir, prefix), (err, directoryPath) => {
        if (err) return reject(err);
        resolve(path.join(directoryPath, `file${suffix}`));
      });
    });

    // Write data to the temporary file
    await fs.promises.writeFile(tempFilePath, data);

    console.log(`Temporary file created at: ${tempFilePath}`);
    return tempFilePath;
  } catch (error) {
    console.error('Error creating temporary file:', error);
    throw error;
  }
}
