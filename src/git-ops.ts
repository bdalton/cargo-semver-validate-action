import {CheckRepoActions, simpleGit} from 'simple-git'

export async function isGitRepo(repoPath: string): Promise<boolean> {
  const status = await simpleGit(repoPath).checkIsRepo(
    CheckRepoActions.IS_REPO_ROOT
  )
  return status
}

export async function branchChanges(repoPath: string): Promise<string[]> {
  const output = await simpleGit(repoPath).raw([
    'diff',
    'main...',
    '--name-only'
  ])
  return output.split(/[\r\n]+/)
}

export async function showContents(
  repoPath: string,
  branch: string,
  path: string
): Promise<string | null> {
  try {
    const gitAddress = `${branch}:${path}`
    const output = await simpleGit(repoPath).show(gitAddress)
    return output
  } catch (error) {
    return null
  }
}
