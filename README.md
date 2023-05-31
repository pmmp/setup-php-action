<p align="center">
  <a href="https://github.com/pmmp/setup-php-action/actions"><img alt="setup-php-action status" src="https://github.com/pmmp/setup-php-action/workflows/build-test/badge.svg"></a>
</p>

# setup-php-action

This action installs PHP and Composer for [PocketMine-MP](https://github.com/pmmp/PocketMine-MP) from [pmmp/PHP-Binaries releases](https://github.com/pmmp/PHP-Binaries/releases).

This is used internally for PM's own CIs, and can also be used by plugins using GitHub Actions.

Currently only supported on Linux, but MacOS and Windows support is planned for the future.

## Inputs
| Name | Required | Possible values | Description |
|:-----|:--------:|:----------------|:------------|
| `php-version` | YES | Any version available in [`pmmp/PHP-Binaries`](https://github.com/pmmp/PHP-Binaries) (currently `8.1` and `8.2`) | PHP version, must be a full `major.minor.patch` |
| `install-path` | YES | Folder path | Path to install the binary into (e.g. `./bin`) |
| `pm-version-major` | NO | `4`, `5` | Major version of [PocketMine-MP](https://github.com/pmmp/PocketMine-MP) to build extensions for |
