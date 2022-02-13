import {ITemplateSection} from '../src/interface';

interface ITemplateTestSample {
  raw: string;
  sections: ITemplateSection[];
}

const templateSample: ITemplateTestSample = {
  raw: `### What this PR does (required):
- list PR functionality here

### Screenshots / Videos (front-end only):
- Post at least one screenshot to show the feature in action. **Only required in front-end work**

### Any information needed to test this feature (required):
- Post what steps to take to be able to test this feature (eg. "sign up as a new user and upload a profile picture from the navbar")

### Any issues with the current functionality (optional):
- List any problems where you were not able to complete all tasks on ticket
- List any problems this PR may cause for the project or other active PRs
- Post a screenshot/video of the problem, along with detailed console outputs where applicable`,
  sections: [
    {
      generic: false,
      title: {
        line: 0,
        raw: '### What this PR does (required):',
        stripped: 'What this PR does',
        suffix: 'required',
      },
      type: 'required',
      start: 1,
      end: 3,
      body: `- list PR functionality here
`,
      lines: ['- list PR functionality here', ''],
    },
    {
      generic: false,
      title: {
        line: 3,
        raw: '### Screenshots / Videos (front-end only):',
        stripped: 'Screenshots / Videos',
        suffix: 'front-end only',
      },
      type: 'frontend',
      start: 4,
      end: 6,
      lines: [
        '- Post at least one screenshot to show the feature in action. **Only required in front-end work**',
        '',
      ],
      body: `- Post at least one screenshot to show the feature in action. **Only required in front-end work**
`,
    },
    {
      generic: false,
      title: {
        line: 6,
        raw: '### Any information needed to test this feature (required):',
        stripped: 'Any information needed to test this feature',
        suffix: 'required',
      },
      type: 'required',
      start: 7,
      end: 9,
      lines: [
        '- Post what steps to take to be able to test this feature (eg. "sign up as a new user and upload a profile picture from the navbar")',
        '',
      ],
      body: `- Post what steps to take to be able to test this feature (eg. "sign up as a new user and upload a profile picture from the navbar")
`,
    },
    {
      generic: false,
      title: {
        line: 9,
        raw: '### Any issues with the current functionality (optional):',
        stripped: 'Any issues with the current functionality',
        suffix: 'optional',
      },
      type: 'optional',
      start: 10,
      end: 13,
      lines: [
        '- List any problems where you were not able to complete all tasks on ticket',
        '- List any problems this PR may cause for the project or other active PRs',
        '- Post a screenshot/video of the problem, along with detailed console outputs where applicable',
      ],
      body: `- List any problems where you were not able to complete all tasks on ticket
- List any problems this PR may cause for the project or other active PRs
- Post a screenshot/video of the problem, along with detailed console outputs where applicable`,
    },
  ],
};

// const prBodySample: ITemplateTestSample = {
//   raw: `### What this PR does (required):
// - added demo button to login and signup pages
// - this is a login button with a hardcoded username and password

// ### Screenshots
// ![Screen Shot 2022-01-12 at 10 05 42 PM](https://user-images.githubusercontent.com/96796802/149258742-b795aa5a-fab1-422f-a372-aab3cfb4321a.png)
// ![Screen Shot 2022-01-12 at 10 06 23 PM](https://user-images.githubusercontent.com/96796802/149258755-c2401171-41ae-4836-8c23-7d3c7f24e35c.png)

// `,
// sections: {

// }
// };

export {templateSample};
