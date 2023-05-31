<p align="center">
  <a href="https://github.com/pmmp/setup-php-action/actions"><img alt="setup-php-action status" src="https://github.com/pmmp/setup-php-action/workflows/build-test/badge.svg"></a>
</p>

# setup-php-action

This action builds and installs PHP with the needed extensions for [PocketMine-MP](https://github.com/pmmp/PocketMine-MP).
This is currently used internally for PM's own CIs, and perhaps by plugins in the future.

## Inputs
| Name | Required | Possible values | Description |
|:-----|:--------:|:----------------|:------------|
| `php-version` | YES | Any version available in [`pmmp/PHP-Binaries`](https://github.com/pmmp/PHP-Binaries) (currently `8.1` and `8.2`) | PHP version, must be a full `major.minor.patch` |
| `install-path` | YES | Folder path | Path to install the binary into (e.g. `./bin`) |
| `pm-version-major` | NO | `4`, `5` | Major version of [PocketMine-MP](https://github.com/pmmp/PocketMine-MP) to build extensions for |
