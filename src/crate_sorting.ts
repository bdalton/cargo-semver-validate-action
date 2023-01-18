import path from 'path'
import {CrateMetadata} from './manifest'

// returns the subset of crates whose baseDir is a prefix for at least one change in changes
export function cratesWithUpdates(crates: CrateMetadata[], changes: string[]): CrateMetadata[] {
    let unmarked = crates.map(crate => crate.baseDir)
    let marked = new Set<string>

    changes.forEach(filename => {
        const i = unmarked.findIndex(prefix => filename.startsWith(prefix))
        if (i >= 0) {
            marked.add(unmarked[i])
            unmarked[i] = unmarked[unmarked.length-1]
            unmarked.pop()
        }
    })

    return crates.filter(crate => marked.has(crate.baseDir))
}