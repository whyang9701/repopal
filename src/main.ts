#!/usr/bin/env node

import { Command, Option } from 'commander'
import { simpleGit } from "simple-git"
import { format } from 'date-fns'
import * as path from 'path'
import fs from 'fs'
import { buildDirectoryHierarchy, getDirectoryStructureString, getFiles } from './fileUtil.js'
import {fileExtensionsToLanguageMap} from './fileMap.js'

const program = new Command()
program
  .name('repopal')
  .description('repo reader for LLM').version('0.1.0', '-v, --version', 'output the current version')
  .argument('<args...>')
  .addOption(new Option('-o, --output <file>', 'output to file instead of console'))
  .action(async (args, options) => {
    try {
      let currentWorkingDirectory = path.join(process.cwd(), args[0])
      let outputString: string
      // one argument, check args[0] is a directory or file
      if (args.length === 1 && fs.statSync(currentWorkingDirectory).isDirectory()) {
        const gitInfo = await getGitInfo(currentWorkingDirectory)
        const filePathArray = await buildDirectoryHierarchy(currentWorkingDirectory)
        outputString = await getOutputString(currentWorkingDirectory, gitInfo, filePathArray)
      }
      else { // single or multiple files
        currentWorkingDirectory = process.cwd()
        const gitInfo = await getGitInfo(currentWorkingDirectory)
        const filepathArray = await getFiles(args)
        outputString = await getOutputString(currentWorkingDirectory, gitInfo, filepathArray)
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


//get git info
async function getGitInfo(cwd): Promise<object> {

  const git = simpleGit({ baseDir: cwd })
  const logResult = await git.log()
  const branchResult = await git.branch()
  const result = {
    hash: logResult.latest.hash,
    branch: branchResult.current,
    author: logResult.latest.author_name,
    email: logResult.latest.author_email,
    date: format(logResult.latest.date, "EEE MMM dd HH:mm:ss yyyy XXX")
  }
  return result
}

// output util for git info
function getGitInfoString(result): string {
  return `- Commit: ${result.hash}
- Branch: ${result.branch}
- Author: ${result.author} <${result.email}>
- Date: ${result.date}`
}

// form final output string
async function getOutputString(currentWorkingDirectory: string, gitInfo: object, filePathArray: Array<string>): Promise<string> {
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
      const content = fs.readFileSync(fullPath)
      lineCount += content.toString().split('\n').length
      outputString += `
### File: ${filePath}
${ext === '.md' ? '````' : '```'}${language}
${content}
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

