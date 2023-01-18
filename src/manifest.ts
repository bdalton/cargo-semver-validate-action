import * as core from '@actions/core'
import * as path from 'path'
import {parse as parseToml} from 'toml'
import {readFileSync} from 'fs'
import {showContents} from './git-ops'

interface WorkspaceManifest {
  workspace: {
    members: string[]
  }
}

interface PackageManifest {
  package: {
    name: string
    version: string
  }
}

type CargoManifest = WorkspaceManifest | PackageManifest

function readManifest(repoRoot: string, manifestDir: string): CargoManifest {
  const manifestPath = path.join(repoRoot, manifestDir, 'Cargo.toml')
  return parseToml(readFileSync(manifestPath, 'utf-8'))
}

async function readBranchManifestVersion(
  repoRoot: string,
  branch: string,
  manifestDir: string
): Promise<string | undefined> {
  const manifestPath = path.join(manifestDir, 'Cargo.toml')
  const contents = await showContents(repoRoot, branch, manifestPath)
  if (contents === null) {
    return undefined
  } else {
    const branchManifest = parseToml(contents)
    if (isPackageManifest(branchManifest)) {
      return branchManifest.package.version
    } else {
      return undefined
    }
  }
}

function isWorkspacManifest(
  manifest: CargoManifest
): manifest is WorkspaceManifest {
  return 'workspace' in manifest
}

function isPackageManifest(
  manifest: CargoManifest
): manifest is PackageManifest {
  return 'package' in manifest
}

export interface CrateMetadata {
  manifestDir: string
  name: string
  version: string
  branchVersion?: string
}

export async function collectCrates(
  repoRoot: string,
  manifestDir: string,
  branch: string
): Promise<CrateMetadata[]> {
  const manifest = readManifest(repoRoot, manifestDir)

  if (isWorkspacManifest(manifest)) {
    core.debug('root manifest is a workspace')
    const crates = []
    for (const member of manifest.workspace.members) {
      const memberDir = path.join(manifestDir, member)
      const memberManifest = readManifest(repoRoot, memberDir)
      const memberBranchVersion = await readBranchManifestVersion(
        repoRoot,
        branch,
        memberDir
      )

      if (isPackageManifest(memberManifest)) {
        const metadata = packageMetadata(
          memberDir,
          memberManifest,
          memberBranchVersion
        )
        crates.push(metadata)
      } else {
        throw new Error('nested workspace manifests are unsupported')
      }
    }
    return crates
  } else {
    core.debug('root manifest is a package')
    const branchVersion = await readBranchManifestVersion(
      repoRoot,
      branch,
      manifestDir
    )
    return [packageMetadata(manifestDir, manifest, branchVersion)]
  }
}

function packageMetadata(
  manifestDir: string,
  manifest: PackageManifest,
  branchVersion: string | undefined
): CrateMetadata {
  return {
    manifestDir,
    name: manifest.package.name,
    version: manifest.package.version,
    branchVersion
  }
}
