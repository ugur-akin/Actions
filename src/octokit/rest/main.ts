import * as core from '@actions/core';
import * as github from '@actions/github';
import {GetResponseDataTypeFromEndpointMethod} from '@octokit/types';
import {GitHub} from '@actions/github/lib/utils';

export type Octokit = InstanceType<typeof GitHub>;
export type PullRequestData = GetResponseDataTypeFromEndpointMethod<
  Octokit['rest']['pulls']['get']
>;

let instance: Octokit;

const initialize = (): void => {
  const auth = core.getInput('GITHUB_TOKEN', {required: true});
  const octokit = github.getOctokit(auth);
  instance = octokit;
};

const getPullRequest = async (
  owner: string,
  repository: string,
  pullNumber: number
): Promise<PullRequestData> => {
  const {data: pullRequest} = await instance.rest.pulls.get({
    owner,
    repo: repository,
    pull_number: pullNumber,
    mediaType: {
      format: 'diff',
    },
  });
  return pullRequest;
};

const getPullRequestTemplate = async (
  owner: string,
  repo: string
): Promise<string> => {
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

export default {initialize, getPullRequest, getPullRequestTemplate};
