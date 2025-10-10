import * as path from 'path'
import fs from 'fs'
import { getDirectoryStructureString, getModifiedTimeString } from './file.js'
import { fileExtensionsToLanguageMap } from './fileMap.js'
import { GitInfo } from './git.js'

// output util for git info
export function getGitInfoString(result: GitInfo): string {
  return `- Commit: ${result.hash}
- Branch: ${result.branch}
- Author: ${result.author} <${result.email}>
- Date: ${result.date}`
}

// form final output string
export async function getOutputString(currentWorkingDirectory: string, gitInfo: GitInfo, filePathArray: Array<string>, preview: number): Promise<string> {
  let outputString = `# Repository Context

## File System Location

${currentWorkingDirectory}

## Git Info

${getGitInfoString(gitInfo)}

## Structure

${'```'}
${getDirectoryStructureString(filePathArray)}
${'```'}

## File Contents
`
  let lineCount = 0
  filePathArray.forEach(filePath => {
    const fullPath = path.join(currentWorkingDirectory, filePath)
    const ext = path.extname(filePath).toLowerCase()
    const language = fileExtensionsToLanguageMap[ext] || ''
    const fileState = fs.statSync(fullPath)
    // check if file is small enough
    if (fileState.isFile() && fileState.size < 16 * 1024) {
      // read each file content
      const contentBuffer = fs.readFileSync(fullPath)
      let contentString: string;
      if (preview) {
        //read first 5 lines only
        preview = typeof preview === 'boolean' ? 5 : parseInt(String(preview), 10)
        const lines = contentBuffer.toString().split('\n')
        contentString = lines.slice(0, preview).join('\n')
        if (lines.length > preview) {
          contentString += `\n... (file truncated, total ${lines.length} lines)`
        }
        lineCount += contentString.split('\n').length
      }
      else {
        lineCount += contentBuffer.toString().split('\n').length
        contentString = contentBuffer.toString()
      }
      outputString += `
### File: ${filePath} (Modified: ${getModifiedTimeString(fileState)})
${ext === '.md' ? '````' : '```'}${language}
${contentString}
${ext === '.md' ? '````' : '```'}
            `
    }
    else if (fileState.isFile()) {
      outputString += `
### File: ${filePath}
${'```'}
File too large to include (over 16KB)
${'```'}
            `
    }
  })
  outputString += `
## Summary
- Total files: ${filePathArray.length}
- Total lines: ${lineCount}
`
  return outputString

}
