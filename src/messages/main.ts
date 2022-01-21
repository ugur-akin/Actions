export const goodTitleMessage = `
Your title looks good overall, thanks for nicely formatting it!
`;

export const badTitleMessage = `
Your pull request title could be improved. Overall, titles:
- should be formatted as proper English, not left as default (e.g. same as the branch name),
- should be appropriately capitalized (first word or all words capitalized are okay),
- should not include any stack labels (e.g. FE/frontend, BE/backend) - there are labels for conveying these,
- should not include issue numbers/links (e.g. #43) - any related issues should be linked in the body.`;

export const goodBodyMessage = `
Your summary looks good overall, thanks for paying attention to your communication!
`;

export const badBodyMessage = `
There are some things we can improve on the summary, namely:
- We should fill all the required information on the template and remove any unused sections,
- We should format the body fully, not carry over any meta-information included in the template, 
- Ideally, we should link the issue in the summary [using the appropriate keyword](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword) (or we can do it [manually](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue#manually-linking-a-pull-request-to-an-issue) when this is not possible),
`;

export const communicationSummaryMessage = (
  titleSummary: string,
  bodySummary: string
): string =>
  `
Hello fellow contributor! I'm a robot and I'll be reviewing your PR for its Communication aspects *\\*beep boop\\**!

Let's start with the pull request title:
${titleSummary}

Then there is the pull request summary:
${bodySummary}


All in all, well-communicating pull requests is an important skill, hence we encourage all candidates to build strong habits in this regard.` +
  `For additional information, [this article](https://hugooodias.medium.com/the-anatomy-of-a-perfect-pull-request-567382bb6067) touches on some more important points.
  
Good luck &#127881`;
