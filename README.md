# did-custom-action-code-change

This action has been customized for [im-open's] needs and may not work exactly for your use case. Please feel free to fork this repository if it needs to be customized.  A more robust change detection action [identify-changes-action](https://github.com/im-open/identify-changes-action) can be used.

This action outputs a flag indicating whether the changes in the PR were to code files and code folders so the build workflow knows whether the action version should be incremented or not. It does this by gathering the list of files and folders changed in a PR through the GH API. The action then compares that list against the list of `files-with-code` and `folders-with-code` to determine if any of those source code items were changed.

This action is intended to be used in the same repo where the PRs are created and in a workflow with a `pull_request` trigger.

## Index

- [Inputs](#inputs)
- [Outputs](#outputs)
- [Usage Examples](#usage-examples)
- [Contributing](#contributing)
  - [Recompiling](#recompiling)
  - [Incrementing the Version](#incrementing-the-version)
- [Code of Conduct](#code-of-conduct)
- [License](#license)

## Inputs

| Parameter           | Is Required | Default | Description                                                       |
| ------------------- | ----------- | ------- | ----------------------------------------------------------------- |
| `files-with-code`   | false       | N/A     | A comma separated list of code files to check for changes.        |
| `folders-with-code` | false       | N/A     | A comma separated list of folders with code to check for changes. |
| `token`             | true        | N/A     | A token with permission to retrieve PR information.               |

## Outputs

| Output        | Description                                                                   |
| ------------- | ----------------------------------------------------------------------------- |
| `HAS_CHANGES` | Flag indicating whether changes were found in the code files or code folders. |

## Usage Examples

```yml
jobs:
  build-action:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Recompile and Format action
        run: npm run build

      - name: Check for code changes to the action
        id: action-code
        uses: im-open/did-custom-action-code-change@v1.0.1
        with:
          files-with-code: 'action.yml,package.json,package-lock.json'
          folders-with-code: 'src,dist'
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Commit unstaged changes if there are code changes
        if: steps.action-code.outputs.HAS_CHANGES == 'true'
        run: |
          if [[ "$(git status --porcelain)" != "" ]]; then
            git add .
            git commit -m "Commit the recompiled action."
            git push origin HEAD:${{ github.head_ref }}
          else
            echo "There were no changes to commit"
          fi
```

## Contributing

When creating new PRs please ensure:

1. For major or minor changes, at least one of the commit messages contains the appropriate `+semver:` keywords listed under [Incrementing the Version](#incrementing-the-version).
1. The action code does not contain sensitive information.

When a pull request is created and there are changes to code-specific files and folders, the build workflow will run and it will recompile the action and push a commit to the branch if the PR author has not done so. The usage examples in the README.md will also be updated with the next version if they have not been updated manually. The following files and folders contain action code and will trigger the automatic updates:

- action.yml
- package.json
- package-lock.json
- src/\*\*
- dist/\*\*

There may be some instances where the bot does not have permission to push changes back to the branch though so these steps should be done manually for those branches. See [Recompiling Manually](#recompiling-manually) and [Incrementing the Version](#incrementing-the-version) for more details.

### Recompiling Manually

If changes are made to the action's code in this repository, or its dependencies, the action can be re-compiled by running the following command:

```sh
# Installs dependencies and bundles the code
npm run build

# Bundle the code (if dependencies are already installed)
npm run bundle
```

These commands utilize [esbuild](https://esbuild.github.io/getting-started/#bundling-for-node) to bundle the action and
its dependencies into a single file located in the `dist` folder.

### Incrementing the Version

Both the build and PR merge workflows will use the strategies below to determine what the next version will be.  If the build workflow was not able to automatically update the README.md action examples with the next version, the README.md should be updated manually as part of the PR using that calculated version.

This action uses [git-version-lite] to examine commit messages to determine whether to perform a major, minor or patch increment on merge. The following table provides the fragment that should be included in a commit message to active different increment strategies.

| Increment Type | Commit Message Fragment                     |
| -------------- | ------------------------------------------- |
| major          | +semver:breaking                            |
| major          | +semver:major                               |
| minor          | +semver:feature                             |
| minor          | +semver:minor                               |
| patch          | *default increment type, no comment needed* |

## Code of Conduct

This project has adopted the [im-open's Code of Conduct](https://github.com/im-open/.github/blob/main/CODE_OF_CONDUCT.md).

## License

Copyright &copy; 2022, Extend Health, LLC. Code released under the [MIT license](LICENSE).

[git-version-lite]: https://github.com/im-open/git-version-lite
[im-open's]: https://github.com/im-open
