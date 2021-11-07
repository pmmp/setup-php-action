import * as core from '@actions/core'
import * as cache from '@actions/cache'
import {exec} from '@actions/exec'
import {hashFiles} from '@actions/glob'
import * as path from 'path'

async function run(): Promise<void> {
    try {
        const phpVersion: string = core.getInput('php-version')
        const installPath: string = core.getInput('install-path')

        const scriptsPath: string = path.dirname(__dirname)
        const buildShPath: string = scriptsPath + path.sep + 'build.sh'
        const primaryCacheKey: string = 'php-build-generic-' + phpVersion + '-' + hashFiles(buildShPath)

        const hitCacheKey: string|undefined = await cache.restoreCache([installPath], primaryCacheKey)

        if (hitCacheKey == undefined) {
            core.info('Compiling new binaries: PHP ' + phpVersion + ' to be installed in ' + installPath)
            await exec(buildShPath, [phpVersion, installPath])
            core.info('Storing cache')
            await cache.saveCache([installPath], primaryCacheKey)
        } else {
            core.info('Installing dependencies for cached PHP build')
            await exec(scriptsPath + path.sep + 'install-dependencies.sh')
        }
        core.info('Adding PHP to PATH')
        core.addPath(installPath)
        core.info('Done!')
    } catch (error) {
        if (error instanceof Error) core.setFailed(error.message)
    }
}

run()
