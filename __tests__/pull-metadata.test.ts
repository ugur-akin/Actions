import * as process from 'process';
import * as cp from 'child_process';
import * as path from 'path';
import {expect, test} from '@jest/globals';
import 'dotenv/config';

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs on template repo', () => {
  process.env['INPUT_OWNER'] = 'ugur-akin';
  process.env['INPUT_REPOSITORY'] = 'coop-starter';
  process.env['INPUT_PULL_NUMBER'] = '21';
  process.env['INPUT_GITHUB_TOKEN'] = process.env['PERSONAL_ACCESS_TOKEN'];
  process.env['INPUT_AIRTABLE_API_KEY'] = process.env['AIRTABLE_API_KEY'];
  process.env['INPUT_AIRTABLE_BASE_ID'] = process.env['AIRTABLE_BASE_ID'];
  const np = process.execPath;
  const ip = path.join(__dirname, '..', 'lib', 'pull-metadata.js');
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

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs on actual repo', () => {
  process.env['INPUT_OWNER'] = 'ugur-akin';
  process.env['INPUT_REPOSITORY'] = 'team-actions-demo';
  process.env['INPUT_PULL_NUMBER'] = '3';
  process.env['INPUT_GITHUB_TOKEN'] = process.env['PERSONAL_ACCESS_TOKEN'];
  process.env['INPUT_AIRTABLE_API_KEY'] = process.env['AIRTABLE_API_KEY'];
  process.env['INPUT_AIRTABLE_BASE_ID'] = process.env['AIRTABLE_BASE_ID'];
  const np = process.execPath;
  const ip = path.join(__dirname, '..', 'lib', 'pull-metadata.js');
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
