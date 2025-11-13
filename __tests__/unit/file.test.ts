import { describe, it, expect, beforeAll } from 'vitest';
import { getFilesFromDirectory, getFiles, getRecentModifiedFiles, getModifiedTimeString, getDirectoryStructureString } from '../../src/file.js'
import path from 'path';
import os from 'os';
import fs from 'fs';
describe("read files", () => {

  let tempFilePath: string
  beforeAll(async () => {
    tempFilePath = await (createTempFile('This is a temporary file for testing purposes.\nIt has multiple lines.\nLine 3.\nLine 4.\nLine 5.', 'temp-file-', '.txt'));

  });
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
    //
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

  it('modified time string format', async () => {

    const fileState = fs.statSync(tempFilePath)
    let timestampString = getModifiedTimeString(fileState)
    expect(timestampString).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)


  });

  it('check directory structure string format', async () => {

    const includePatterns = ['**/*']
    const excludePatterns = []
    const currentWorkingDirectory = process.cwd()
    const filePathArray = await getFilesFromDirectory(currentWorkingDirectory, includePatterns, excludePatterns)
    const outputString = getDirectoryStructureString(filePathArray)
    const expectedString = `__tests__/
  unit/
    file.test.ts
  vitest.config.ts
assets/
build/
  __tests__/
    unit/
      file.test.js
      file.test.js.map
    vitest.config.js
    vitest.config.js.map
  src/
    file.js
    file.js.map
    fileMap.js
    fileMap.js.map
    git.js
    git.js.map
    loadConfig.js
    loadConfig.js.map
    main.js
    main.js.map
    output.js
    output.js.map
coverage/
src/
  file.ts
  fileMap.ts
  git.ts
  loadConfig.ts
  main.ts
  output.ts
eslint.config.mjs
LICENSE
package-lock.json
package.json
README.md
tsconfig.json
tsconfig.release.json`
    expect(outputString).toBe(expectedString)
  });
});


async function createTempFile(data, prefix = 'temp-file-', suffix = '.txt'): Promise<string> {
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
