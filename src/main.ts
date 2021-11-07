import * as cache from '@actions/cache'
import * as core from '@actions/core'
import * as path from 'path'
import {exec} from '@actions/exec'
import {hashFiles} from '@actions/glob'

async function run(): Promise<void> {
  try {
    const phpVersion: string = core.getInput('php-version')
    const installPath: string = core.getInput('install-path')
    const absoluteInstallPath: string = path.resolve(installPath)

    const scriptsPath: string = path.dirname(__dirname)
    const buildShPath: string = path.join(scriptsPath, 'build.sh')
    const primaryCacheKey = `php-build-generic-${phpVersion}-${hashFiles(
      buildShPath
    )}`

    const hitCacheKey: string | undefined = await cache.restoreCache(
      [absoluteInstallPath],
      primaryCacheKey
    )

    if (hitCacheKey === undefined) {
      core.info(
        `Compiling new binaries: PHP ${phpVersion} to be installed in ${absoluteInstallPath}`
      )
      await exec(buildShPath, [phpVersion, absoluteInstallPath])
      core.info('Storing cache')
      await cache.saveCache([absoluteInstallPath], primaryCacheKey)
    } else {
      core.info('Installing dependencies for cached PHP build')
      await exec(path.join(scriptsPath, 'install-dependencies.sh'))
    }
    core.info('Adding PHP to PATH')
    core.addPath(path.join(absoluteInstallPath, 'bin'))
    core.info('Done!')
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
