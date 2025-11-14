import { describe, it, expect, beforeAll } from 'vitest';
import { getFilesFromDirectory, getFiles, getRecentModifiedFiles, getModifiedTimeString, getDirectoryStructureString, insert } from '../../src/file.js'
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
    filePathArray = getRecentModifiedFiles(process.cwd(), filePathArray, 365)
    expect(filePathArray.includes(('LICENSE'))).toBe(true)
  });

  it('modified time string format', async () => {

    const fileState = fs.statSync(tempFilePath)
    const timestampString = getModifiedTimeString(fileState)
    expect(timestampString).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)


  });

  it('check directory structure string format', async () => {

    const includePatterns = ['src/*']
    const excludePatterns = []
    const currentWorkingDirectory = process.cwd()
    const filePathArray = await getFilesFromDirectory(currentWorkingDirectory, includePatterns, excludePatterns)
    const outputString = getDirectoryStructureString(filePathArray)
    const expectedString = `src/
  file.ts
  fileMap.ts
  git.ts
  loadConfig.ts
  main.ts
  output.ts`
    expect(outputString).toEqual(expectedString)
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

describe('insert', () => {
  it('inserts a file path correctly', () => {
    const root = { name: '', isDir: true, children: new Map() };
    insert(root, 'a/b/file.txt', false);
    expect(root.children.has('a')).toBe(true);
    const aNode = root.children.get('a');
    expect(aNode?.isDir).toBe(true);
    const bNode = aNode?.children?.get('b');
    expect(bNode?.isDir).toBe(true);
    const fileNode = bNode?.children?.get('file.txt');
    expect(fileNode?.isDir).toBe(false);
  });

  it('marks intermediate nodes as directories', () => {
    const root = { name: '', isDir: true, children: new Map() };
    insert(root, 'dir1/dir2', true);
    const dir1 = root.children.get('dir1');
    expect(dir1?.isDir).toBe(true);
    const dir2 = dir1?.children?.get('dir2');
    expect(dir2?.isDir).toBe(true);
  });

  it('updates existing node to directory if needed', () => {
    const root = { name: '', isDir: true, children: new Map() };
    insert(root, 'folder/file', false);
    insert(root, 'folder', true); // update to directory explicitly
    const folder = root.children.get('folder');
    expect(folder?.isDir).toBe(true);
  });

  it('handles root insertions correctly', () => {
    const root = { name: '', isDir: true, children: new Map() };
    insert(root, 'file.txt', false);
    expect(root.children.has('file.txt')).toBe(true);
    const fileNode = root.children.get('file.txt');
    expect(fileNode?.isDir).toBe(false);
  });

  it('updates a file node to directory if inserted again as directory', () => {
    const root = { name: '', isDir: true, children: new Map() };
    // First insertion, marked as a file
    insert(root, 'a/b/c', false);
    let cNode = root.children.get('a')?.children?.get('b')?.children?.get('c');
    expect(cNode).toBeDefined();
    expect(cNode?.isDir).toBe(false);

    // Insert the same path again, but change it to a directory.
    insert(root, 'a/b/c', true);
    cNode = root.children.get('a')?.children?.get('b')?.children?.get('c');
    expect(cNode).toBeDefined();
    expect(cNode?.isDir).toBe(true);
  });
});
