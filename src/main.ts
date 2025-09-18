#!/usr/bin/env node

import { Command } from 'commander'
import { simpleGit } from "simple-git"
import { format } from 'date-fns'
import * as path from 'path'
import fs from 'fs'
import { buildDirectoryHierarchy, getDirectoryStructureString, getFiles, Node } from './fileUtil.js'

const program = new Command()
program
  .name('repopal')
  .description('repo reader for LLM').version('0.0.1', '-v, --version', 'output the current version')
  .argument('<args...>')
  .action(async (args) => {
    try {
      let currentWorkingDirectory = path.join(process.cwd(), args[0])
      let outputString: string
      // one argument, check args[0] is a directory or file
      if (args.length === 1 && fs.statSync(currentWorkingDirectory).isDirectory()) {
        const gitInfo = await getGitInfo(currentWorkingDirectory)
        const dirStructure = await buildDirectoryHierarchy(currentWorkingDirectory)
        outputString = await getOutputString(currentWorkingDirectory, gitInfo, dirStructure)
      }
      else { // single or multiple files
        currentWorkingDirectory = process.cwd()
        const gitInfo = await getGitInfo(currentWorkingDirectory)
        const fileNodes = await getFiles(args)
        outputString = await getOutputString(currentWorkingDirectory, gitInfo, fileNodes)
      }
      console.log(outputString)
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
async function getOutputString(currentWorkingDirectory: string, gitInfo: object, dirStructure: Node): Promise<string> {

  return (`# Repository Context

## File System Location

${currentWorkingDirectory}

## Git Info

${getGitInfoString(gitInfo)}

## Structure

${'```'}
${getDirectoryStructureString(dirStructure)}
${'```'}
`)

}

