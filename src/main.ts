import * as core from '@actions/core';
import * as github from '@actions/github';
import {wait} from './wait';

async function run(): Promise<void> {
  try {
    const category: string = core.getInput('for');
    const tags: string[] = JSON.parse(core.getInput('tags'));

    core.debug(`Starting an automated review for ${category}, including checks for:
    - ${tags.join(',\n- ')}`);

    const owner = core.getInput('owner');
    const repository = core.getInput('repository');
    const pullNumber = Number(core.getInput('pull_number'));
    const auth = core.getInput('GITHUB_TOKEN');
    const octokit = github.getOctokit(auth);

    const pullInput = core.getInput('pull_payload');
    let pullRequest = pullInput && JSON.parse(pullInput);
    if (!pullRequest) {
      const {data: pullPayload} = await octokit.rest.pulls.get({
        owner,
        repo: repository,
        pull_number: pullNumber,
        mediaType: {
          format: 'diff',
        },
      });

      pullRequest = pullPayload;
    }

    const ms: string = core.getInput('milliseconds');
    core.debug(`Waiting ${ms} milliseconds ...`); // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

    core.debug(new Date().toTimeString());
    await wait(parseInt(ms, 10));
    core.debug(new Date().toTimeString());

    core.setOutput('time', new Date().toTimeString());
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
