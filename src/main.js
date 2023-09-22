const core = require('@actions/core');
const github = require('@actions/github');

// When used, this requiredArgOptions will cause the action to error if a value has not been provided.
const requiredArgOptions = {
  required: true,
  trimWhitespace: true
};

const filesToCheckForChangesInput = core.getInput('files-with-code') || '';
const filesToCheckForChanges = filesToCheckForChangesInput.split(',');

const foldersToCheckForChangesInput = core.getInput('folders-with-code') || '';
const foldersToCheckForChanges = foldersToCheckForChangesInput.split(',');

const token = core.getInput('token', requiredArgOptions);
const octokit = github.getOctokit(token);

async function getPRFiles(org, repo, prNumber) {
  let prFiles = [];
  await octokit
    .paginate(octokit.rest.pulls.listFiles, {
      owner: org,
      repo: repo,
      pull_number: prNumber
    })
    .then(prFileResponse => {
      prFiles = prFileResponse.map(prf => prf.filename);
    })
    .catch(error => {
      core.error(`An error occurred retrieving the PR files: ${error.message}`);
    });
  return prFiles;
}

async function run() {
  const eventName = github.context.eventName;
  if (eventName !== 'pull_request' && eventName !== 'pull_request_target') {
    core.setFailed('The workflow must have a pull_request or pull_request_target trigger.');
    return;
  }

  const org = github.context.repo.owner;
  const repo = github.context.repo.repo;
  const prNumber = github.context.issue.number;

  const filesChangedInPr = await getPRFiles(org, repo, prNumber);
  const foldersChangedInPr = filesChangedInPr.filter(f => f.includes('/')).map(f => f.split('/')[0]);

  const matchingFiles = filesToCheckForChanges.filter(f => filesChangedInPr.includes(f)) || [];
  const matchingFolders = foldersToCheckForChanges.filter(f => foldersChangedInPr.includes(f)) || [];

  const hasMatchingChanges = matchingFiles.length > 0 || matchingFolders.length > 0;

  core.setOutput('HAS_CHANGES', hasMatchingChanges);
  core.exportVariable('CODE_HAS_CHANGED', hasMatchingChanges);
}

run();
