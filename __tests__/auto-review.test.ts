import * as process from 'process';
import * as cp from 'child_process';
import * as path from 'path';
import {expect, test, beforeAll} from '@jest/globals';
import 'dotenv/config';

test('test runs', () => {
  process.env['INPUT_CATEGORY'] = 'Communication';
  process.env[
    'INPUT_TAGS'
  ] = `["suboptimal-branch-name","suboptimal-commit-names","suboptimal-unedited-title","modified-pr-template","leftover-pr-template"]`;
  process.env['INPUT_OWNER'] = 'ugur-akin';
  process.env['INPUT_REPOSITORY'] = 'team-actions-demo';
  process.env['INPUT_PULL_NUMBER'] = '3';
  process.env['INPUT_GITHUB_TOKEN'] = process.env['PERSONAL_ACCESS_TOKEN'];
  const np = process.execPath;
  const ip = path.join(__dirname, '..', 'lib', 'auto-review.js');
  const options: cp.ExecFileSyncOptions = {
    env: process.env,
    encoding: 'utf-8',
  };

  try {
    console.log(cp.execFileSync(np, [ip], options).toString());
  } catch (err) {
    console.log(err);
    throw err;
  }
});
