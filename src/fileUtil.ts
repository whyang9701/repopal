// scripts/fileUtil.ts
import fg from 'fast-glob'

interface Node {
  name: string
  isDir: boolean
  children?: Map<string, Node>
}

function insert(root: Node, relPath: string, isDir: boolean): void {
  const parts = relPath.split('/').filter(Boolean)
  let current = root;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    const isLast = i === parts.length - 1
    if (!current.children) current.children = new Map()
    let child = current.children.get(part)
    if (!child) {
      child = { name: part, isDir: isLast ? isDir : true }
      current.children.set(part, child)
    } else if (isLast && isDir) {
      child.isDir = true
    }
    current = child
  }
}

function printTree(root: Node, prefix = ''): string {
  if (!root.children) return ''
  // Sort: directories first, then files, each group alphabetically
  const entries = Array.from(root.children.values()).sort((a, b) => {
    if (a.isDir !== b.isDir) return a.isDir ? -1 : 1
    return a.name.localeCompare(b.name)
  })

  const lines: string[] = []
  for (const node of entries) {
    lines.push(prefix + node.name + (node.isDir ? '/' : ''))
    if (node.isDir) {
      lines.push(printTree(node, prefix + '  '))
    }
  }
  return lines.filter(Boolean).join('\n')
}

export async function getFilesFromDirectory(rootDir = '.', includePatterns: Array<string> = ['**/*'], excludePatterns: Array<string> = []): Promise<Array<string>> {
  // Collect files & directories
  const entries = await fg(includePatterns, {
    cwd: rootDir,
    dot: false,
    onlyFiles: false,
    markDirectories: true,
    ignore: ['**/node_modules/**', '**/.git/**', ...excludePatterns]
  })

  return entries

}

export async function getFiles(filesArray: Array<string>): Promise<Array<string>> {
  // Collect files & directories
  const entries = await fg(filesArray, {
    cwd: '.',
    dot: true,
    onlyFiles: true,
  })
  return entries

}

export function getDirectoryStructureString(entries): string {
  const root: Node = { name: '', isDir: true, children: new Map() }

  for (const entry of entries) {
    const isDir = entry.endsWith('/')
    const cleaned = isDir ? entry.slice(0, -1) : entry
    insert(root, cleaned, isDir)
  }
  return printTree(root)
}
