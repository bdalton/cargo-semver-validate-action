import {CrateMetadata} from './manifest'

// returns the subset of crates whose baseDir is a prefix for at least one change in changes
export function partitionCrates(
  crates: CrateMetadata[],
  changes: string[]
): [CrateMetadata[], CrateMetadata[]] {
  const unmarked = crates.map(crate => crate.manifestDir)
  const marked = new Set<string>()

  for (const filename of changes) {
    // core(`${filename}: ${unmarked.join(', ')}`)
    const i = unmarked.findIndex(prefix => filename.startsWith(prefix))
    if (i >= 0) {
      marked.add(unmarked[i])
      unmarked[i] = unmarked[unmarked.length - 1]
      unmarked.pop()
    }
  }

  return partition(crates, crate => marked.has(crate.manifestDir))
}

function partition<T>(arr: T[], fn: (x: T) => boolean): [T[], T[]] {
  return arr.reduce<[T[], T[]]>(
    (acc, val) => {
      const q = fn(val)
      const part = q ? 0 : 1
      acc[part].push(val)
      return acc
    },
    [[], []]
  )
}
