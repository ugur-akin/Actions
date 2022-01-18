import * as core from '@actions/core';
import octokit, {PullRequestData} from './octokit/rest/main';

async function run(): Promise<void> {
  try {
    octokit.initialize();
    const category: string = core.getInput('for');
    const tags: string[] = JSON.parse(core.getInput('tags'));

    core.debug(`Starting an automated review for ${category}, including checks for:
    - ${tags.join(',\n- ')}`);

    const owner = core.getInput('owner');
    const repository = core.getInput('repository');
    const pullNumber = Number(core.getInput('pull_number'));

    const pullInput = core.getInput('pull_payload');
    const hasPullInput = pullInput !== '';

    const pullRequest: PullRequestData = hasPullInput
      ? JSON.parse(pullInput)
      : octokit.getPullRequest(owner, repository, pullNumber);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
