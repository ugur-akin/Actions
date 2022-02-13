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
export type IssueData = GetResponseDataTypeFromEndpointMethod<
  Octokit['rest']['issues']['get']
>;

export interface IOctokitWrapper {
  getPullRequest: () => Promise<PullRequestData>;
  getPullRequestTemplate: () => Promise<string>;
  postReview: (
    summary: string,
    event?: PullRequestEvent
  ) => Promise<PullReviewData>;
  getIssue: (issueNumber: number) => Promise<IssueData>;
}

const OctokitWrapper = (() => {
  let instance: IOctokitWrapper;
  let owner: string;
  let repo: string;
  let pull_number: number;
  let isConfigured = false;

  const config = (
    _owner: string,
    _repo: string,
    _pull_number: number,
    _token: string
  ): IOctokitWrapper => {
    if (isConfigured) {
      throw new Error('Instance is already configured!');
    }

    const octokit = github.getOctokit(_token);

    owner = _owner;
    repo = _repo;
    pull_number = _pull_number;
    isConfigured = true;

    const getPullRequest = async (): Promise<PullRequestData> => {
      const {data: pullRequest} = await octokit.rest.pulls.get({
        owner,
        repo,
        pull_number,
      });
      return pullRequest;
    };
    const getPullRequestTemplate = async (): Promise<string> => {
      const {data: rawFileContents} = await octokit.rest.repos.getContent({
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

    const getIssue = async (issueNumber: number): Promise<IssueData> => {
      const {data: pullRequest} = await octokit.rest.issues.get({
        owner,
        repo,
        issue_number: issueNumber,
      });
      return pullRequest;
    };

    const postReview = async (
      summary: string,
      event: PullRequestEvent = 'COMMENT'
    ): Promise<PullReviewData> => {
      try {
        // TODO: implement comments
        const {data: review} = await octokit.rest.pulls.createReview({
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

    instance = {getPullRequest, getPullRequestTemplate, postReview, getIssue};

    return instance;
  };

  const getInstance = (): IOctokitWrapper => {
    if (!isConfigured) {
      throw new Error(
        "Context isn't configured. Please call `.config()` before accessing the instance"
      );
    }
    return instance;
  };

  return {config, getInstance};
})();

export default OctokitWrapper;
