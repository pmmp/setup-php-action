import * as core from '@actions/core'
import * as path from 'path'
import * as toolCache from '@actions/tool-cache'
import {promises as fs} from 'fs'
import {glob} from 'glob'

async function run(): Promise<void> {
  try {
    const phpVersion: string = core.getInput('php-version')
    const installPath: string = core.getInput('install-path')
    const absoluteInstallPath: string = path.resolve(installPath)
    const pmVersionMajor: string = core.getInput('pm-version-major')

    //TODO: MacOS and Windows support
    const binaryTarballUrl = `https://github.com/pmmp/PHP-Binaries/releases/download/pm${pmVersionMajor}-php-${phpVersion}-latest/PHP-${phpVersion}-Linux-x86_64-PM${pmVersionMajor}.tar.gz`
    core.info(`Downloading PHP binary: ${binaryTarballUrl}`)
    const binaryTarballPath: string = await toolCache.downloadTool(
      binaryTarballUrl
    )
    const binaryDir: string = await toolCache.extractTar(
      binaryTarballPath,
      absoluteInstallPath
    )

    core.info('Looking for extensions dir')
    const extensionDirParent: string = path.join(
      binaryDir,
      'bin',
      'php7',
      'lib',
      'php',
      'extensions'
    )
    const extensionDirCandidates: string[] = await glob(
      `${extensionDirParent}/*debug-zts*`
    )
    if (extensionDirCandidates.length > 1) {
      throw new Error(
        `Expected exactly 1 extension directory, but have ${extensionDirCandidates.length}`
      )
    } else if (extensionDirCandidates.length === 1) {
      //the directory might not exist if there are no shared extensions
      const extensionDir = extensionDirCandidates[0]
      const phpIniPath = path.join(binaryDir, 'bin', 'php7', 'bin', 'php.ini')
      const phpIniRaw = await fs.readFile(phpIniPath, 'utf-8')
      if (phpIniRaw.match(/^extension_dir.+$/m)) {
        core.info(`Replacing extension_dir in php.ini: "${extensionDir}"`)
        await fs.writeFile(
          phpIniPath,
          phpIniRaw.replace(
            /^extension_dir.+$/,
            'extension_dir="${extensionDir}"'
          )
        )
      } else {
        core.info(`Adding extension_dir to php.ini: "${extensionDir}"`)
        await fs.writeFile(
          phpIniPath,
          phpIniRaw.concat('\n', `extension_dir="${extensionDir}"`, '\n')
        )
      }
    }

    const composerUrl =
      'https://getcomposer.org/download/latest-2.x/composer.phar'
    core.info(`Downloading latest Composer 2.x version: ${composerUrl}`)
    const composerDownloadPath: string = await toolCache.downloadTool(
      composerUrl
    )
    const executablePath: string = path.join(
      absoluteInstallPath,
      'bin/php7/bin'
    )
    const composerExecutablePath: string = path.join(executablePath, 'composer')
    await fs.copyFile(composerDownloadPath, composerExecutablePath)
    await fs.chmod(composerExecutablePath, 0o755)

    core.info('Adding PHP and Composer to PATH')
    core.addPath(path.join(binaryDir, 'bin/php7/bin'))

    core.info('Done!')
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
