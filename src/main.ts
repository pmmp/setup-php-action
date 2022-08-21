import * as cache from '@actions/cache'
import * as core from '@actions/core'
import * as path from 'path'
import {exec} from '@actions/exec'
import * as crypto from 'crypto'
import {promises as fsPromises} from 'fs'

async function run(): Promise<void> {
  try {
    const phpVersion: string = core.getInput('php-version')
    const installPath: string = core.getInput('install-path')
    const absoluteInstallPath: string = path.resolve(installPath)

    const scriptsPath: string = path.dirname(__dirname)
    const buildShPath: string = path.join(scriptsPath, 'build.sh')
    const buildShContents: string = await fsPromises.readFile(
      buildShPath,
      'utf8'
    )
    const buildShHash: string = crypto
      .createHash('sha256')
      .update(buildShContents)
      .digest('hex')

    const primaryCacheKey = `php-build-generic-${phpVersion}-${buildShHash}`

    core.info(`Looking for cached binaries under key ${primaryCacheKey}`)

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
