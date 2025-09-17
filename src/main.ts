#!/usr/bin/env node

import { Command } from 'commander'
import { simpleGit } from "simple-git"
import { format } from 'date-fns'
import * as path from 'path'
import { getDirectoryStructure, getDirectoryStructureString } from './printTree.js'

const program = new Command()
program
  .name('repopal')
  .description('repo reader for LLM').version('0.0.1', '-v, --version', 'output the current version')
  .argument('<args...>')
  .action(async (args) => {
    console.log(await getOutputString(args))
  })
program.parse()

//get working directroy by args size
function getCWD(args: Array<string>): string {
  let currentWorkingDirectory: string
  if (args.length === 1) {
    currentWorkingDirectory = path.join(process.cwd(), args[0])
  }
  else {
    currentWorkingDirectory = process.cwd()
  }
  return currentWorkingDirectory
}

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
async function getOutputString(args): Promise<string> {
  const currentWorkingDirectory = getCWD(args)
  const gitInfo = await getGitInfo(currentWorkingDirectory)
  const dirStructure = await getDirectoryStructure(currentWorkingDirectory);
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

