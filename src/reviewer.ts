const githubNumberNotationRe = /([\s_-]|^)#?\d+/;
const stackLabelRe = /(\s\d_-\/|^)(fs|fe|be|in)(\s\d_-\/|$)/i;
const endlRe = /\r?\n/;
const titleLineRe = /^(#+)\s*(?<title>.*)\s*(\(.*\):)?$/;
const automaticLinkRe =
  /(close|closes|closed|fix|fixes|fixed|resolve|resolves|resolved) #\d+/i;

const isLetter = (c: string): boolean => {
  return c.toLowerCase() !== c.toUpperCase();
};

const replaceDashes = (str: string): string => {
  const result = str.replace('-', ' ');
  return result;
};

const startsWithCapitalizedLetter = (str: string): boolean => {
  const first = str.at(0);
  if (first) {
    const result = isLetter(first) && first === first.toUpperCase();
    return result;
  }

  return false;
};

const toLowerCaseAlphabeticOnly = (str: string): string => {
  const alphabetic = str.replace(/[^a-zA-Z]/, '');
  const result = alphabetic.toLowerCase();
  return result;
};

// const getPullRequestTemplate = async (octokit, owner, repo) => {
//   try {
//     const result = await octokit.rest.repos.getContent({
//       owner,
//       repo,
//       path: 'pull_request_template.md',
//       mediaType: {
//         format: 'raw',
//       },
//     });

//     return result;
//   } catch (e) {
//     console.error(e);
//     return undefined;
//   }
// };

const getTemplateSections = (template: string): ITemplateSections => {
  const lines = template.split(endlRe);

  /**
   * An array containing sections. Section body is lines [start, end).
   * Section title is at line `start-1`
   */
  const sections = [];
  lines.forEach((lineContent, lineNumber) => {
    const match = lineContent.match(sectionTitleRe);
    if (!match) {
      return;
    }

    const {title} = match.groups;
    const currentSection = {title, start: lineNumber + 1};

    // Set the end of last section
    if (sections.length) {
      sections.at(-1).end = lineNumber;
    }
    sections.push(currentSection);
  });
  sections.at(-1).end = lines.length + 1;

  sections.forEach((section, sectionNo, arr) => {
    const {title, start, end} = section;
    const nextSectionNo = sectionNo + 1;
  });
};

const splitBodyIntoTemplateSections = (body, sections) => {
  sectionTitles.map(title => {
    // const titleRe; //
  });
};

const isEmptyOrWhitespace = (str: string): boolean => {
  const match = str.match(/^\s*$/);
  const result = Boolean(match);
  return result;
};

/**
 * Checks Following:
 *  - The first letter of the title is capitalized.
 *    Candidates can opt to capitalize each word or just the first one.
 *  - Title isn't same as the head branch name
 *  - Title doesn't include the issue number
 *  - Title doesn't include stack indicators such as FS, FE, IN, BE...
 *
 * TODO:
 *  - Use masked bits to return error profiles?
 *  - TS Interface for pull requests, github has one?
 */
const titlePassesChecks = (pull: {
  title: string;
  head: {ref: string};
}): boolean => {
  const {title, head} = pull;
  const {ref} = head;

  const captialized = startsWithCapitalizedLetter(title);
  const branchNameUntouched =
    toLowerCaseAlphabeticOnly(title) === toLowerCaseAlphabeticOnly(ref);
  const includesIssueLink = title.search(githubNumberNotationRe) !== -1;
  const includesStackLabel = title.search(stackLabelRe) !== -1;

  //TODO: Use bitshift to return a code?
  const failed =
    !captialized ||
    branchNameUntouched ||
    includesIssueLink ||
    includesStackLabel;

  return !failed;
};

/**
 * Checks Following:
 *  - Any line in template appears unedited in the body (except titles),
 *  - A section is empty but isn't removed
 *  - A section is removed but is required (TODO: Implement later as it depends on other features)
 *  - Section titles are not edited (e.g. contains (required))
 *  - Body doesn't link issue (NOTE: This only works when base === default_branch)
 */
const bodyPassesChecks = async (pull, octokit) => {
  try {
    const {body, repo, base} = pull;
    const mergesToDefaultBranch = base.ref === repo.default_branch;

    const templateStr = await getPullRequestTemplate(
      octokit,
      repo.name,
      repo.owner.login
    );

    const templateLines = templateStr.split(endlRe);
    const bodyLines = body.split(endlRe);
    const hasUneditedLine = bodyLines.some(line => {
      const isTitleLine = Boolean(line.match(titleLineRe));
      const isEmptyLine = isEmptyOrWhitespace(line);
      // TODO: More clever string matching below (e.g. removed partially)?
      const containsTemplateLine = templateLines.some(templateLine =>
        line.includes(templateLine)
      );

      return !isTitleLine && !isEmptyLine && containsTemplateLine;
    });

    const templateTitles = getTemplateSections(template);
    const bodySections = splitBodyIntoTemplateSections(body, templateTitles);
    const hasEmptySection = bodySections.some(section =>
      isEmptyOrWhitespace(section.body)
    );
    const hasUneditedTitle = bodySections.some(
      section => !section.hasCleanTitle
    );
    const missingAutomaticIssueLink =
      mergesToDefaultBranch && Boolean(body.match(automaticLinkRe));

    const failed =
      hasUneditedLine ||
      hasEmptySection ||
      hasUneditedTitle ||
      missingAutomaticIssueLink;

    return failed;
  } catch (e) {
    throw e;
  }
};
export {titlePassesChecks, bodyPassesChecks};
