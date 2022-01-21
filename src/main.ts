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
    const category: string = core.getInput('for');
    const tags: string[] = JSON.parse(core.getInput('tags'));

    core.debug(`Starting an automated review for ${category}, including checks for:
    - ${tags.join(',\n- ')}`);

    const owner = core.getInput('owner');
    const repository = core.getInput('repository');
    const pullNumber = Number(core.getInput('pull_number'));
    octokit.initialize(owner, repository, pullNumber);

    const pullInput = core.getInput('pull_payload');
    const hasPullInput = pullInput !== '';

    const pullRequest: PullRequestData = hasPullInput
      ? JSON.parse(pullInput)
      : octokit.getPullRequest();

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
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
