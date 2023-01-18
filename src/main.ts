import * as core from '@actions/core'
import {branchChanges, isGitRepo} from './git-ops'
import {collectCrates} from './manifest'
import {partitionCrates} from './partition-crates'

async function run(): Promise<void> {
  try {
    const branch = core.getInput('mainBranch') || 'main'
    const repoPath = core.getInput('repoPath')
    const rootManifest = core.getInput('manifestDir')

    core.debug(`repoPath: ${repoPath}`)
    core.debug(`rootManifestPath: ${rootManifest}`)
    core.debug(`branch: ${branch}`)

    if (!isGitRepo(repoPath)) {
      throw new Error('action needs to be run in the root of a git repo')
    }

    const modifiedFiles = await branchChanges(repoPath)
    core.debug(`${modifiedFiles.length} modified files`)

    const manifests = await collectCrates(repoPath, rootManifest, branch)
    const crateNames = manifests.map(
      manifest =>
        `${manifest.name}@${manifest.version}->${manifest.branchVersion}`
    )
    core.debug(`crates: ${crateNames.join(', ')}`)

    const [modifiedManifests, unmodifiedManifests] = partitionCrates(
      manifests,
      modifiedFiles
    )
    const modifiedCrateNames = modifiedManifests.map(manifest => manifest.name)
    const unmodifiedCrateNames = unmodifiedManifests.map(
      manifest => manifest.name
    )
    core.debug(`modified crates: ${modifiedCrateNames.join(', ')}`)
    core.debug(`unmodified crates: ${unmodifiedCrateNames.join(', ')}`)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
