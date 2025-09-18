import { simpleGit } from "simple-git"
import { format } from 'date-fns'
//get git info
export async function getGitInfo(cwd): Promise<object> {

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
export function getGitInfoString(result): string {
  return `- Commit: ${result.hash}
- Branch: ${result.branch}
- Author: ${result.author} <${result.email}>
- Date: ${result.date}`
}
