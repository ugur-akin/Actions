import * as core from '@actions/core';
import {
  badBodyMessage,
  badTitleMessage,
  communicationSummaryMessage,
  goodBodyMessage,
  goodTitleMessage,
} from './messages/main';
import {bodyPassesChecks, titlePassesChecks} from './reviewer';
import octokit, {PullRequestData} from './octokit/rest/main';

async function run(): Promise<void> {
  try {
    const category: string = core.getInput('category', {required: true});

    //TODO: Remove this temporary check
    if (category !== 'Communication') {
      throw new Error(
        `"${category}" is not a valid category or its automated reviewer is not yet implemented.`
      );
    }

    const tags = JSON.parse(
      core.getInput('tags', {required: true})
    ) as string[];

    core.debug(`
Starting an automated review for ${category}, including checks for: 
- ${tags.join(',\n- ')}`);

    const owner = core.getInput('owner', {required: true});
    const repository = core.getInput('repository', {required: true});
    const pullNumber = Number(core.getInput('pull_number', {required: true}));

    core.debug(`Reviwing ${owner}/${repository}/pulls/${pullNumber}`);
    octokit.initialize(owner, repository, pullNumber);

    const pullInput = core.getInput('pull_payload');
    const hasPullInput = pullInput !== '';

    const pullInputDebugMessage = !hasPullInput
      ? `Pull payload isn't provided in inputs, will be fetched with REST API.`
      : `Pull payload received from inputs`;
    core.debug(pullInputDebugMessage);

    const pullRequest: PullRequestData = hasPullInput
      ? JSON.parse(pullInput)
      : await octokit.getPullRequest();

    // core.debug(`Pull Request: ${JSON.stringify(pullRequest, null, 2)}`);

    const templateAsStr = await octokit.getPullRequestTemplate();

    const goodTitle = titlePassesChecks(pullRequest);
    const goodBody = bodyPassesChecks(pullRequest, templateAsStr);

    const titleSummary = goodTitle ? goodTitleMessage : badTitleMessage;
    const bodySummary = goodBody ? goodBodyMessage : badBodyMessage;

    const reviewSummary = communicationSummaryMessage(
      titleSummary,
      bodySummary
    );

    const pullReview = await octokit.postReview(reviewSummary);
    core.debug(`Review successfully posted at ${pullReview.html_url}`);
    core.setOutput('pull_review', pullReview);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error);
  }
}

run();
