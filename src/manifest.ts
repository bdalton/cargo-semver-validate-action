import {parse as parseToml} from 'toml'
import { readFileSync } from 'fs'
import * as path from 'path'

interface WorkspaceManifest {
    workspace: {
        members: string[]
    }
}
  
interface PackageManifest {
    package: {
        name: string,
        version: string,
    }
}

type CargoManifest = WorkspaceManifest | PackageManifest

function readManifest(manifestPath: string): CargoManifest {
    return parseToml(readFileSync(manifestPath, 'utf-8'))
}

function isWorkspacManifest(manifest: CargoManifest): manifest is WorkspaceManifest {
    return 'workspace' in manifest
}

function isPackageManifest(manifest: CargoManifest): manifest is PackageManifest {
    return 'package' in manifest
}

interface CrateMetadata {
    baseDir: string,
    manifestPath: string,
    name: string,
    version: string,
}

export function collectCrates(root: string): CrateMetadata[] {
    const manifestPath = path.join(root, 'Cargo.toml')
    const manifest = readManifest(manifestPath)

    if (isWorkspacManifest(manifest)) {
        return manifest.workspace.members.map(member => {
            const memberRoot = path.join(root, member)
            const memberPath = path.join(memberRoot, 'Cargo.toml')
            const memberManifest = readManifest(memberPath)

            if (isPackageManifest(memberManifest)) {
                return packageMetadata(memberRoot, memberPath, memberManifest)
            } else {
                throw "foo!"
            }})
    } else {
        return [packageMetadata(root, manifestPath, manifest)]
    }
}

function packageMetadata(baseDir: string, manifestPath: string, manifest: PackageManifest): CrateMetadata {
    return {
        baseDir,
        manifestPath,
        name: manifest.package.name,
        version: manifest.package.version,
    }
}
