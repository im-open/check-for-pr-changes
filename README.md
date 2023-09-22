# did-custom-action-code-change

This action has been customized for [im-open's] needs and may not work exactly for your use case. Please feel free to fork this repository if it needs to be customized.

This action outputs a flag indicating whether the changes in the PR were to code files and code folders so the build workflow knows whether the action version should be incremented or not. It does this by gathering the list of files and folders changed in a PR through the GH API. The action then compares that list against the list of `files-with-code` and `folders-with-code` to determine if any of those source code items were changed.

This action is intended to be used in the same repo where the PRs are created and in a workflow with a `pull_request` trigger.

## Index <!-- omit in toc -->

- [did-custom-action-code-change](#did-custom-action-code-change)
  - [Inputs](#inputs)
  - [Outputs and Environment Variables](#outputs-and-environment-variables)
  - [Usage Examples](#usage-examples)
  - [Contributing](#contributing)
    - [Incrementing the Version](#incrementing-the-version)
    - [Source Code Changes](#source-code-changes)
    - [Recompiling Manually](#recompiling-manually)
    - [Updating the README.md](#updating-the-readmemd)
  - [Code of Conduct](#code-of-conduct)
  - [License](#license)

## Inputs

| Parameter           | Is Required | Default | Description                                                       |
|---------------------|-------------|---------|-------------------------------------------------------------------|
| `files-with-code`   | false       | N/A     | A comma separated list of code files to check for changes.        |
| `folders-with-code` | false       | N/A     | A comma separated list of folders with code to check for changes. |
| `token`             | true        | N/A     | A token with permission to retrieve PR information.               |

## Outputs and Environment Variables

| Output                 | Description                                                                   |
|------------------------|-------------------------------------------------------------------------------|
| `outputs.HAS_CHANGES`  | Flag indicating whether changes were found in the code files or code folders. |
| `env.CODE_HAS_CHANGED` | Flag indicating whether changes were found in the code files or code folders. |

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
        # You may also reference just the major or major.minor version
        uses: im-open/did-custom-action-code-change@v1.0.3
        with:
          files-with-code: 'action.yml,package.json,package-lock.json'
          folders-with-code: 'src,dist'
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Commit unstaged changes if there are code changes
        if: steps.action-code.outputs.HAS_CHANGES == 'true' # can also use env.CODE_HAS_CHANGED
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

When creating PRs, please review the following guidelines:

- [ ] The action code does not contain sensitive information.
- [ ] At least one of the commit messages contains the appropriate `+semver:` keywords listed under [Incrementing the Version] for major and minor increments.
- [ ] The action has been recompiled.  See [Recompiling Manually] for details.
- [ ] The README.md has been updated with the latest version of the action.  See [Updating the README.md] for details.

### Incrementing the Version

This repo uses [git-version-lite] in its workflows to examine commit messages to determine whether to perform a major, minor or patch increment on merge if [source code] changes have been made.  The following table provides the fragment that should be included in a commit message to active different increment strategies.

| Increment Type | Commit Message Fragment                     |
|----------------|---------------------------------------------|
| major          | +semver:breaking                            |
| major          | +semver:major                               |
| minor          | +semver:feature                             |
| minor          | +semver:minor                               |
| patch          | *default increment type, no comment needed* |

### Source Code Changes

The files and directories that are considered source code are listed in the `files-with-code` and `dirs-with-code` arguments in both the [build-and-review-pr] and [increment-version-on-merge] workflows.  

If a PR contains source code changes, the README.md should be updated with the latest action version and the action should be recompiled.  The [build-and-review-pr] workflow will ensure these steps are performed when they are required.  The workflow will provide instructions for completing these steps if the PR Author does not initially complete them.

If a PR consists solely of non-source code changes like changes to the `README.md` or workflows under `./.github/workflows`, version updates and recompiles do not need to be performed.

### Recompiling Manually

This command utilizes [esbuild] to bundle the action and its dependencies into a single file located in the `dist` folder.  If changes are made to the action's [source code], the action must be recompiled by running the following command:

```sh
# Installs dependencies and bundles the code
npm run build
```

### Updating the README.md

If changes are made to the action's [source code], the [usage examples] section of this file should be updated with the next version of the action.  Each instance of this action should be updated.  This helps users know what the latest tag is without having to navigate to the Tags page of the repository.  See [Incrementing the Version] for details on how to determine what the next version will be or consult the first workflow run for the PR which will also calculate the next version.

## Code of Conduct

This project has adopted the [im-open's Code of Conduct](https://github.com/im-open/.github/blob/main/CODE_OF_CONDUCT.md).

## License

Copyright &copy; 2023, Extend Health, LLC. Code released under the [MIT license](LICENSE).

<!-- Links -->
[Incrementing the Version]: #incrementing-the-version
[Recompiling Manually]: #recompiling-manually
[Updating the README.md]: #updating-the-readmemd
[source code]: #source-code-changes
[usage examples]: #usage-examples
[build-and-review-pr]: ./.github/workflows/build-and-review-pr.yml
[increment-version-on-merge]: ./.github/workflows/increment-version-on-merge.yml
[esbuild]: https://esbuild.github.io/getting-started/#bundling-for-node
[git-version-lite]: https://github.com/im-open/git-version-lite
[im-open's]: https://github.com/im-open
