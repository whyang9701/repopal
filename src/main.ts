#!/usr/bin/env node

import { Command, Option } from 'commander'
import * as path from 'path'
import fs from 'fs'
import { getFilesFromDirectory, getDirectoryStructureString, getFiles, getRecentModifiedFiles, getModifiedTimeString } from './fileUtil.js'
import {fileExtensionsToLanguageMap} from './fileMap.js'
import { getGitInfo, getGitInfoString } from './gitUtil.js'
import { loadConfig } from './configUtil.js'

// Load TOML config file if it exists
const config = loadConfig()

const program = new Command()
program
  .name('repopal')
  .description('repo reader for LLM').version('0.1.0', '-v, --version', 'output the current version')
  .argument('[args...]', 'directory to scan or list of files')
  .addOption(new Option('-o, --output <file>', 'output to file instead of console').default(config.output))
  .addOption(new Option('--include <pattern>', 'include files matching the pattern, ignored if specific files are provided').default(config.include))
  .addOption(new Option('--exclude <pattern>', 'exclude files matching the pattern, ignored if specific files are provided').conflicts('include').default(config.exclude))
  .addOption(new Option('-r, --recent [days]', 'only include the most recently (7 days) modified files per directory').default(config.recent))
  .addOption(new Option('--preview [lines]', 'enable preview features, if not specified, defaults to 5 lines').default(config.preview))
  .action(async (args, options) => {
    args = args.length ? args : ['.']
    try {
      const includePatterns = options.include ? String(options.include).split(',') : ['**/*']
      const excludePatterns = options.exclude ? String(options.exclude).split(',') : []
      // first arg is directory or file
      let currentWorkingDirectory = path.join(process.cwd(), args[0])
      let outputString: string
      // one argument, check args[0] is a directory or file
      const recentDays = options.recent ? parseInt(options.recent, 10) : parseInt(String(options.recent), 10) || 7
      if (args.length === 1 && fs.statSync(currentWorkingDirectory).isDirectory()) {
        const gitInfo = await getGitInfo(currentWorkingDirectory)
        const filePathArray = await getFilesFromDirectory(currentWorkingDirectory, includePatterns, excludePatterns)
        // Filter recently modified files
        const recentFiles = getRecentModifiedFiles(currentWorkingDirectory, filePathArray, recentDays)
        outputString = await getOutputString(currentWorkingDirectory, gitInfo, recentFiles, options.preview)
      }
      else { // single or multiple files
        currentWorkingDirectory = process.cwd()
        const gitInfo = await getGitInfo(currentWorkingDirectory)
        const filepathArray = await getFiles(args)
        // Filter recently modified files
        const recentFiles = getRecentModifiedFiles(currentWorkingDirectory, filepathArray, recentDays)
        outputString = await getOutputString(currentWorkingDirectory, gitInfo, recentFiles, options.preview)
      }

      if (options.output) {
        fs.writeFileSync(options.output, outputString)
      } else {
        console.log(outputString)
      }
    }
    catch (err) {
      console.error("Error: ", err.message)
      process.exit(1)
    }
  })
program.parse()


// form final output string
async function getOutputString(currentWorkingDirectory: string, gitInfo: object, filePathArray: Array<string>, preview: number): Promise<string> {
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
      let contentString;
      if( preview ) {
        //read first 5 lines only
        preview = typeof preview === 'boolean' ? 5 : parseInt(String(preview), 10)
        const lines = contentBuffer.toString().split('\n')
        contentString = lines.slice(0, preview).join('\n')
        if(lines.length > preview){
          contentString += `\n... (file truncated, total ${lines.length} lines)`
        }
        lineCount += contentString.split('\n').length
      }
      else{
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

