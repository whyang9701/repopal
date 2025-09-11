#!/usr/bin/env node

import { Command } from 'commander'
import { simpleGit } from "simple-git";
import { format } from 'date-fns';
import * as path from 'path'

const program = new Command();
program
  .name('repopal')
  .description('repo reader for LLM') .version('0.0.1','-v, --version', 'output the current version')
  .argument('<args...>')
  .action( async ( args )=>{
    let currentWorkingDirectory:string
    if(args.length === 1){
      currentWorkingDirectory = path.join(process.cwd(),args[0])
    }
    else{
      currentWorkingDirectory = process.cwd();
    }
    const git = simpleGit({ baseDir: currentWorkingDirectory})
    const logResult = await git.log()
    const branchResult = await git.branch()

    console.log(`# Repository Context
## File System Location

${currentWorkingDirectory}

## Git Info


- Commit: ${logResult.latest.hash}
- Branch: ${branchResult.current}
- Author: ${logResult.latest.author_name} <${logResult.latest.author_email}>
- Date: ${format(logResult.latest.date, "EEE MMM dd HH:mm:ss yyyy XXX")}

## Structure
`)
  })
program.parse();


