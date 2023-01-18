import * as core from '@actions/core'
import {collectCrates} from './manifest'
import {isGitRepo, branchChanges} from './git_ops'



async function run(): Promise<void> {
  try {
    // const root = '../mmba-assertion-service'
    // console.log(collectCrates(root))
    console.log(await isGitRepo())
    console.log(await branchChanges())


    // const srcRoot = readFileSync('Cargo.toml', 'utf-8')
    // const ms: string = core.getInput('milliseconds')
    // core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

    // core.debug(new Date().toTimeString())
    // await wait(parseInt(ms, 10))
    // core.debug(new Date().toTimeString())

    // core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}


run()
