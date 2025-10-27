import { simpleGit } from "simple-git"
import { format } from 'date-fns'
import * as path from 'path'

export interface GitInfo {
  hash: string,
  branch: string,
  author: string,
  email: string,
  date: string
}

//get git info
export async function getGitInfo(cwd: string): Promise<GitInfo> {

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

export async function cloneRemoteRepo(remoteUrl: string): Promise<string> {
  const tempDir = path.join('temp')
  const git = simpleGit()
  await git.clone(remoteUrl, tempDir)
  return tempDir
}
