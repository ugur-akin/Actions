import {ProblemOccuranceState} from './reviewer';

export const goodTitleMessage = `
Your title looks good overall, thanks for nicely formatting it! &#9989;
`;

export const badTitleMessage = `
Your pull request title could be improved. Overall, titles:
- should be formatted as proper English, not left as default (e.g. same as the branch name),
- should be appropriately capitalized (first word or all words capitalized are okay),
- should not include any stack labels (e.g. FE/frontend, BE/backend) - there are labels for conveying these,
- should not include issue numbers/links (e.g. #43) - any related issues should be linked in the body.`;

export const goodBodyMessage = `
Your summary looks good overall, thanks for paying attention to your communication! &#9989;
`;

export const badBodyMessage = `
There are some things we can improve on the summary, namely:
- We should fill all the required information on the template and remove any unused sections,
- We should format the body fully, not carry over any meta-information included in the template, 
- Ideally, we should link the issue in the summary [using the appropriate keyword](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword) (or we can do it [manually](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue#manually-linking-a-pull-request-to-an-issue) when this is not possible),
`;

export type ProblemMessageType = {
  [key: string]: string;
};

// TODO: Edit "Here" link, edit links in general
// TODO: Problem encounter context!
const titleProblemMessages = {
  'default-title':
    "Leaving the title as the default value isn't ideal in most situations.",
  'improper-casing':
    'Pull titles should be written in plain English, following either `Sentence/Proper case`.',
  'issue-link-in-title':
    "Title isn't the best place to associate a pull request with an issue. See more here.",
  'stack-label-in-title':
    'We should avoid using stack labels such as `FE/BE` in the title and use labels to maintain this information.',
} as ProblemMessageType;

const bodyProblemMessages = {
  'unedited-template-line':
    'When we fill in the pull request template, we should remove any unused lines.',
  'empty-section':
    'No need to include a section from the template if it has no content.',
  'includes-title-metadata':
    'The template contains some metadata information for the contributors (e.g. `(Required/Front-end only)` in section titles). Ideally, we clean these up before we submit the pull request.',
  'issue-link-missing':
    'The best way to associate a pull request with the issue(s) is by using one of the supported keywords to link it in the pull request body.',
} as ProblemMessageType;

const communicationSubSections = ['Pull Request Title', 'Pull Request Body'];

export const communicationSummaryMessage = (
  titleProblemState: ProblemOccuranceState,
  bodyProblemState: ProblemOccuranceState
): string => {
  //TODO: Dynamic
  //TODO: Clean up the template literals
  //TODO: Count remaining problems and include before outro
  const category = 'Communication';
  const messages = [titleProblemMessages, bodyProblemMessages];
  const problemStates = [titleProblemState, bodyProblemState];

  const intro = `
Hello fellow contributor! I'm a robot &#129302; and I'll be reviewing your PR looking at the most common problems we enconter for this project. This feedback is regarding the **${category}** aspect of your pull request *\\*beep boop\\**!
`;

  const subSectionSummaries = communicationSubSections.map(
    (subsection, idx) => {
      const title = `### Comments About Your ${subsection}:`;
      const subsectionMessages = messages[idx];
      const summaryListItems = Object.entries(problemStates[idx]).map(
        ([problem, state]) => {
          const raw = subsectionMessages[problem];
          if (!raw) {
            throw new Error(`There is no message for the problem ${problem}!`);
          }
          // NOTE:
          //    If state is true, rule has failed! Highlight the message and
          //    add a cross emoji. If passed, strikethrough and add a check mark!
          const wrapped = state ? `- ${raw} &#10060;` : `- ~${raw}~ &#9989;`;
          return wrapped;
        }
      );
      const summary = summaryListItems.join('\n');
      return `${title}
${summary}

`;
    }
  );

  const body = subSectionSummaries.join('\n');

  const outro = `\
All in all, well-communicating pull requests is an important skill, hence we encourage all candidates to build strong\
 habits in this regard. For additional information, [this article](https://hugooodias.medium.com/the-anatomy-of-a-perfect-pull-request-567382bb6067)\
 touches on some more important points.

Good luck &#127881;`;

  return `${intro}
${body}
${outro}`;
};
