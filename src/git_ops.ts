import {simpleGit, SimpleGit, CheckRepoActions} from 'simple-git'
const git: SimpleGit = simpleGit(process.cwd(), { trimmed: true })

export async function isGitRepo(): Promise<boolean> {
    const status = await git.checkIsRepo(CheckRepoActions.IS_REPO_ROOT)
    return status
}

export async function branchChanges(): Promise<string[]> {
    return await (await git.raw(['diff', 'main...', '--name-only'])).split(/[\r\n]+/)
}