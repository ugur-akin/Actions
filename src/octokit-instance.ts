import * as core from '@actions/core';
import * as github from '@actions/github';
// This should be exported based on the docs:
//  https://github.com/octokit/types.ts/tree/7e5dd312188253e962fa209b16963f78113ba8c3#get-response-types-from-endpoint-methods
// eslint-disable-next-line import/named
import {GetResponseDataTypeFromEndpointMethod} from '@octokit/types';
import {GitHub} from '@actions/github/lib/utils';
import {PullRequestEvent} from './interface';

export type Octokit = InstanceType<typeof GitHub>;
export type PullRequestData = GetResponseDataTypeFromEndpointMethod<
  Octokit['rest']['pulls']['get']
>;
export type PullReviewData = GetResponseDataTypeFromEndpointMethod<
  Octokit['rest']['pulls']['createReview']
>;

let instance: Octokit;
let owner: string;
let repo: string;
let pull_number: number;

const initialize = (
  _owner: string,
  _repo: string,
  _pull_number: number
): void => {
  const auth = core.getInput('GITHUB_TOKEN', {required: true});
  const octokit = github.getOctokit(auth);
  instance = octokit;
  owner = _owner;
  repo = _repo;
  pull_number = _pull_number;
};

const getPullRequest = async (): Promise<PullRequestData> => {
  const {data: pullRequest} = await instance.rest.pulls.get({
    owner,
    repo,
    pull_number,
  });
  return pullRequest;
};

const getPullRequestTemplate = async (): Promise<string> => {
  const {data: rawFileContents} = await instance.rest.repos.getContent({
    owner,
    repo,
    path: 'pull_request_template.md',
    mediaType: {
      format: 'raw',
    },
  });

  if (typeof rawFileContents === 'string') {
    return rawFileContents;
  } else {
    throw new Error(
      `Unable to fetch contents of the template file as text. Type of response payload is ${typeof rawFileContents}, expected string.`
    );
  }
};

const postReview = async (
  summary: string,
  event: PullRequestEvent = 'COMMENT'
): Promise<PullReviewData> => {
  try {
    // TODO: implement comments
    const {data: review} = await instance.rest.pulls.createReview({
      owner,
      repo,
      pull_number,
      event,
      body: summary,
    });
    return review;
  } catch (err) {
    throw err;
  }
};

export default {initialize, getPullRequest, getPullRequestTemplate, postReview};
export {getPullRequest, getPullRequestTemplate, postReview};
