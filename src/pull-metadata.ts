import * as core from '@actions/core';
import OctokitWrapper, {IssueData, PullRequestData} from './octokit-wrapper';
import {JSDOM} from 'jsdom';
import airtable from './airtable';
import axios from 'axios';

// The labels below are used for every pull
const additionalLabels = ['generic'];

const issueHtmlRe =
  /https:\/\/github.com\/(?<org>.+)\/(?<repo>.+)\/issues\/(?<num>\d+)/;

const getIssueNumberFromUrl = (url: string): number | null => {
  const match = url.match(issueHtmlRe);
  if (match && match.groups) {
    const {num} = match.groups;

    const issueNumber = parseInt(num, 10);
    if (issueNumber !== undefined) {
      return issueNumber;
    }
  }
  return null;
};

const fetchPullRequest = async (url: string): Promise<string> => {
  try {
    const resp = await axios.get(url, {
      headers: {'Content-Type': 'text/html'},
      withCredentials: true,
    });

    return await resp.data;
  } catch (err) {
    throw new Error(`Unable to fetch pull request at ${url}`);
  }
};

const run = async (): Promise<void> => {
  try {
    const AIRTABLE_API_KEY = core.getInput('AIRTABLE_API_KEY', {
      required: true,
    });
    const AIRTABLE_BASE_ID = core.getInput('AIRTABLE_BASE_ID', {
      required: true,
    });

    const owner = core.getInput('owner', {required: true});
    const repository = core.getInput('repository', {required: true});
    const pullNumber = Number(core.getInput('pull_number', {required: true}));
    const token = core.getInput('GITHUB_TOKEN', {required: true});

    const octokit = OctokitWrapper.config(owner, repository, pullNumber, token);

    const pullInput = core.getInput('pull_payload');
    const hasPullInput = pullInput !== '';

    const pullInputDebugMessage = !hasPullInput
      ? `Pull payload isn't provided in inputs, will be fetched with REST API.`
      : `Pull payload received from inputs`;
    core.debug(pullInputDebugMessage);

    const pullRequest: PullRequestData = hasPullInput
      ? JSON.parse(pullInput)
      : await octokit.getPullRequest();

    const html = await fetchPullRequest(pullRequest.html_url);
    const {document} = new JSDOM(html).window;

    const issuesForm = document.querySelector(`form[aria-label="Link issues"]`);
    let issues: IssueData[] = [];
    if (issuesForm) {
      const anchors = issuesForm.querySelectorAll('a');
      const issueNumbers: number[] = [];

      for (const anchor of anchors) {
        const issueURL = anchor.getAttribute('href');
        if (issueURL) {
          const issueNumber = getIssueNumberFromUrl(issueURL);
          if (issueNumber) {
            issueNumbers.push(issueNumber);
          }
        }
      }

      const issueRequests: Promise<IssueData>[] = issueNumbers.map(async num =>
        octokit.getIssue(num)
      );
      issues = await Promise.all(issueRequests);
    }
    const issueTitles = issues.map(issue => issue.title);
    const issueLabels = issues.reduce((labels, issue) => {
      const newLabels = [] as string[];
      for (const label of issue.labels) {
        if (typeof label === 'string') {
          newLabels.push(label);
        } else {
          label.name && newLabels.push(label.name);
        }
      }
      return [...labels, ...newLabels];
    }, [] as string[]);

    const prLabels = pullRequest.labels
      .map(label => label.name)
      .filter(name => name !== undefined) as string[];

    const labelSet = new Set<string>();
    issueLabels.forEach(label => labelSet.add(label));
    prLabels.forEach(label => labelSet.add(label));
    additionalLabels.forEach(label => labelSet.add(label));

    const labels = [...labelSet];

    const {categorySet, tagMap} = await airtable
      .init(AIRTABLE_API_KEY, AIRTABLE_BASE_ID)
      .fetchProblemTags(labels, issueTitles);
    const categories = [...categorySet];

    core.setOutput('issues', issueTitles);
    core.setOutput('labels', labels);
    core.setOutput('categories', categories);
    core.setOutput('tags', tagMap);
  } catch (err) {
    if (err instanceof Error) {
      core.setFailed(err);
    } else {
      core.setFailed(`Something went wrong: ${err}`);
    }
  }
};

run();
