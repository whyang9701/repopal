#!/usr/bin/env node

import { Command, Option } from 'commander'
import * as path from 'path'
import fs from 'fs'
import { getFilesFromDirectory, getFiles, getRecentModifiedFiles } from './file.js'
import { getGitInfo, cloneRemoteRepo } from './git.js'
import { loadConfig } from './loadConfig.js'
import { getOutputString } from './output.js'
// Load TOML config file if it exists
const config = loadConfig()

const program = new Command()
program
  .name('repopal')
  .description('repo reader for LLM').version('0.1.0', '-v, --version', 'output the current version')
  .argument('[args...]', 'directory to scan or list of files')
  .addOption(new Option('--remote <file>', 'remote repository URL to fetch git info from'))
  .addOption(new Option('-o, --output <file>', 'output to file instead of console').default(config.output))
  .addOption(new Option('--include <pattern>', 'include files matching the pattern, ignored if specific files are provided').default(config.include))
  .addOption(new Option('--exclude <pattern>', 'exclude files matching the pattern, ignored if specific files are provided').conflicts('include').default(config.exclude))
  .addOption(new Option('-r, --recent [days]', 'only include the most recently (7 days) modified files per directory').default(config.recent))
  .addOption(new Option('--preview [lines]', 'enable preview features, if not specified, defaults to 5 lines').default(config.preview))
  .action(async (args, options) => {
    try {
      if (options.remote) {
        const tempDir = await cloneRemoteRepo(options.remote)
        args = [tempDir]
        await main(options, args)
        // clean up temp directory
        fs.rmSync(tempDir, { recursive: true, force: true })
      }
      else {
        await main(options, args)
      }
    }
    catch (err) {
      console.error("Error: ", err.message)
      process.exit(1)
    }
  })

program.parse()

interface Options {
  remote?: string
  output?: string
  include?: string
  exclude?: string
  recent?: string | boolean
  preview?: number
}

async function main(options: Options, args: Array<string>): Promise<void> {
  args = args.length ? args : ['.']
  const includePatterns = options.include ? String(options.include).split(',') : ['**/*']
  const excludePatterns = options.exclude ? String(options.exclude).split(',') : []
  // first arg is directory or file
  let currentWorkingDirectory = path.join(process.cwd(), args[0])
  let filepathArray: Array<string> = []
  // one argument, check args[0] is a directory or file
  if (args.length === 1 && fs.statSync(currentWorkingDirectory).isDirectory()) {
    filepathArray = await getFilesFromDirectory(currentWorkingDirectory, includePatterns, excludePatterns)
  }
  else {
    currentWorkingDirectory = process.cwd()
    filepathArray = await getFiles(args)
  }
  if (options.recent) {
    const recentDays = parseInt(String(options.recent), 10) || 7
    filepathArray = getRecentModifiedFiles(currentWorkingDirectory, filepathArray, recentDays)
  }
  const gitInfo = await getGitInfo(currentWorkingDirectory)
  const outputString = await getOutputString(currentWorkingDirectory, gitInfo, filepathArray, options.preview)
  if (options.output) {
    fs.writeFileSync(options.output, outputString)
  } else {
    console.log(outputString)
  }
}



