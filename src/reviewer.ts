import {
  IPullBodySection,
  ISectionOccurance,
  IStringSectionTitle,
  ITemplateSection,
  SectionType,
} from './interface';
import {PullRequestData} from './octokit-wrapper';

// TODO: Temporarily exporting everything for unit tests,
//       hide exports using Rewire or similar.

const githubNumberNotationRe = /([\s_-]|^)#?\d+/;
const stackLabelRe = /([\s\d_\-/]|^)(fs|fe|be|in)([\s\d_\-/]|$)/i;
const endlRe = /\r?\n/;
const titleLineRe = /^(#+)\s*(?<title>.+?)\s*(\((?<suffix>.*)\):)?$/;
const automaticLinkRe =
  /(close|closes|closed|fix|fixes|fixed|resolve|resolves|resolved) #\d+/i;
const requiredRe = /required/i;
const frontendRe = /front-end|frontend/i;
const backendRe = /back-end|backend/i;

export const isLetter = (c: string): boolean => {
  if (c.length !== 1) {
    throw new Error(
      `isLetter must be called on a single character, argument has ${c.length}`
    );
  }
  return c.toLowerCase() !== c.toUpperCase();
};

export const replaceDashes = (str: string): string => {
  const result = str.replace('-', ' ');
  return result;
};

export const startsWithCapitalizedLetter = (str: string): boolean => {
  const first = str.at(0);
  if (first) {
    const result = isLetter(first) && first === first.toUpperCase();
    return result;
  }

  return false;
};

export const toLowerCaseAlphabeticOnly = (str: string): string => {
  const alphabetic = str.replace(/[^a-zA-Z]/, '');
  const result = alphabetic.toLowerCase();
  return result;
};

export const getSectionTypeFromSuffix = (
  suffix: string | undefined
): SectionType => {
  if (suffix) {
    const required = Boolean(suffix.match(requiredRe));
    if (required) return 'required';

    const frontend = Boolean(suffix.match(frontendRe));
    if (frontend) return 'frontend';

    const backend = Boolean(suffix.match(backendRe));
    if (backend) return 'backend';
  }

  return 'optional';
};

export const getTemplateSections = (template: string): ITemplateSection[] => {
  const lines = template.split(endlRe);

  /**
   * An array containing sections. Section body is lines [start, end).
   * Section title is at line `start-1`
   */
  const sections: ITemplateSection[] = [];

  for (const [lineIdx, line] of lines.entries()) {
    const match = line.match(titleLineRe);

    // New section found
    if (match !== null && match.groups !== undefined) {
      const prev = sections.at(-1);

      // Conclude last section if exists
      if (prev !== undefined) {
        prev.end = lineIdx; // [start, end)
        prev.body = prev.lines.join('\n');
      }

      // Init new section
      const sectionTitle: IStringSectionTitle = {
        stripped: match.groups.title,
        raw: line,
        line: lineIdx,
        suffix: match.groups.suffix,
      };

      const section: ITemplateSection = {
        generic: false,
        title: sectionTitle,
        start: lineIdx + 1, // +1 because range doesn't include title
        type: getSectionTypeFromSuffix(sectionTitle.suffix),
        lines: [],
        body: '',
        end: lineIdx + 1,
      };

      sections.push(section);
    } else {
      // Not a title line:
      const prev = sections.at(-1);

      // Create a generic section if the template
      // is misformatted (e.g. doesn't start with a title line)
      if (prev === undefined) {
        const section = {
          generic: true,
          start: lineIdx,
          end: lineIdx,
          lines: [],
          body: '',
        } as ITemplateSection;
        section.lines.push(line);
        section.start = lineIdx;

        sections.push(section);
      } else {
        prev.lines.push(line);
      }
    }
  }

  // Conclude last section
  const lastSection = sections.at(-1);
  if (lastSection !== undefined) {
    lastSection.body = lastSection.lines.join('\n');
    lastSection.end = lines.length;
  }

  return sections;
};

export const splitBodyIntoTemplateSections = (
  body: string,
  templateSections: ITemplateSection[]
): IPullBodySection[] => {
  const lines = body.split(endlRe);

  // Generate occurances
  const sectionOccurances = [] as ISectionOccurance[];
  for (const section of templateSections) {
    // Sometimes, template can have generic sections
    // (e.g. without a title). They don't need to be split.
    if (section.generic) continue;

    // TODO: Handle multiple occurances (e.g. mistake)
    // We compare against stripped title since header
    // formats (e.g. "##" vs "###") or suffixes can vary.
    const occuranceLine = lines.findIndex(line =>
      line.includes(section.title.stripped)
    );
    if (occuranceLine === -1) {
      continue;
    }

    const occurance = {
      line: occuranceLine,
      section,
    } as ISectionOccurance;

    sectionOccurances.push(occurance);
  }

  // Sort occurances by occurance order (top-down)
  sectionOccurances.sort((s1, s2) => s1.line - s2.line);

  // Add a sentinel if no occurances found or the first
  // occurance doesn't start from first line (this is possible)
  // when the body starts with a generic section. Unshift to maintain
  // order.
  const first = sectionOccurances.at(0);
  if (!first || first.line !== 0) {
    const genericOccurance = {line: 0} as ISectionOccurance;
    sectionOccurances.unshift(genericOccurance);
  }

  // Determine ranges for each section occurance
  const sectionRanges = sectionOccurances.reduce(
    (ranges, occurance, occuranceIdx) => {
      const start = occurance.line;
      const isLastOccurance = sectionOccurances.length === occuranceIdx + 1;
      const end = !isLastOccurance && sectionOccurances[occuranceIdx + 1].line;

      const range = end ? [start, end] : [start];
      return [...ranges, range];
    },
    [] as number[][]
  );

  const sections = [] as IPullBodySection[];

  // When everything is right, each section should have a range
  if (sectionRanges.length !== sectionOccurances.length) {
    throw new Error(
      `Section ranges are split incorrectly: the number of section occurances (${sectionOccurances.length}) ` +
        `is different than the number of section ranges (${sectionRanges.length}).`
    );
  }

  // Fill in sections
  for (const [idx, range] of sectionRanges.entries()) {
    const start = range.at(0);
    if (start === undefined)
      throw new Error('There is an empty section range!');
    const end = range.at(1);
    if (end === undefined && idx !== sectionRanges.length - 1)
      throw new Error(
        `A section range of [start, undefined] is allowed only for the last range:` +
          ` encountered at ${idx + 1}th range (there are ${
            sectionRanges.length
          })`
      );

    //TODO: Check if section has a title
    const rawTitle = lines.at(start);
    if (!rawTitle) {
      throw new Error(
        `Section start is out of range: [${start}, ${end}) is not contained in [0, ${lines.length})`
      );
    }
    const title = {} as IStringSectionTitle;
    title.raw = rawTitle;
    //TODO: Do type narrowing or null checking
    const titleMatch = title.raw.match(titleLineRe);
    title.stripped = titleMatch?.groups?.title!;
    title.suffix = titleMatch?.groups?.suffix;
    title.line = start;

    const section = {} as IPullBodySection;
    section.templateSection = sectionOccurances[idx].section;
    section.title = title;
    section.start = start + 1;
    section.end = end || lines.length;
    section.lines = lines.slice(section.start, section.end);
    section.body = section.lines.join('\n');

    sections.push(section);
  }

  return sections;
};

export const isEmptyOrWhitespace = (str: string): boolean => {
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
export type ProblemOccuranceState = {
  [key: string]: boolean;
};

export const runTitleChecks = (
  pull: PullRequestData
): ProblemOccuranceState => {
  const {title, head} = pull;
  const {ref} = head;

  const captialized = startsWithCapitalizedLetter(title);
  const branchNameUntouched =
    toLowerCaseAlphabeticOnly(title) === toLowerCaseAlphabeticOnly(ref);
  const includesIssueLink = title.search(githubNumberNotationRe) !== -1;
  const includesStackLabel = title.search(stackLabelRe) !== -1;

  //TODO: Use bitshift to return a code?
  const result = {
    'improper-casing': !captialized,
    'default-title': branchNameUntouched,
    'issue-link-in-title': includesIssueLink,
    'stack-label-in-title': includesStackLabel,
  };

  return result;
};

/**
 * Checks Following:
 *  - Any line in template appears unedited in the body (except titles),
 *  - A section is empty but isn't removed
 *  - A section is removed but is required (TODO: Implement later as it depends on other features)
 *  - Section titles are not edited (e.g. contains (required))
 *  - Body doesn't link issue (NOTE: This only works when base === default_branch)
 */
export const runBodyChecks = (
  pull: PullRequestData,
  templateStr: string
): ProblemOccuranceState => {
  const {body, head, base} = pull;

  // TODO: Move some of these property assurances outside?
  if (!head || !head.repo) {
    throw new Error(`Pull request should include the property pull.head.repo`);
  }

  if (!body) {
    throw new Error(`Pull request body is empty`);
  }

  const mergesToDefaultBranch = base.ref === head.repo.default_branch;

  const templateLines = templateStr.split(endlRe);
  const bodyLines = body.split(endlRe);
  const hasUneditedLine = bodyLines.some(line => {
    const isTitleLine = Boolean(line.match(titleLineRe));
    const isEmptyLine = isEmptyOrWhitespace(line);
    // TODO: More clever string matching below (e.g. removed partially)?
    const containsTemplateLine = templateLines.some(templateLine =>
      line.includes(templateLine)
    );
    // TODO: Implement checks against section type (e.g. "required"/"frontend"/"optional")

    return !isTitleLine && !isEmptyLine && containsTemplateLine;
  });

  const templateSections = getTemplateSections(templateStr);
  const bodySections = splitBodyIntoTemplateSections(body, templateSections);
  const hasEmptySection = bodySections.some(
    section => section.templateSection && isEmptyOrWhitespace(section.body)
  );
  const hasUneditedTitle = bodySections.some(section =>
    Boolean(section.title?.suffix)
  );
  const missingAutomaticIssueLink =
    mergesToDefaultBranch && Boolean(body.match(automaticLinkRe));

  const result = {
    'unedited-template-line': hasUneditedLine,
    'empty-section': hasEmptySection,
    'includes-title-metadata': hasUneditedTitle,
    'issue-link-missing': missingAutomaticIssueLink,
  };

  return result;
};
