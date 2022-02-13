import Airtable from 'airtable';

export type CategoryTagMap = {
  [key: string]: string[];
};

export type FetchResult = {
  categorySet: Set<string>;
  tagMap: CategoryTagMap;
};

export type AirtableRest = {
  fetchProblemTags: (
    labels: string[],
    issues: string[]
  ) => Promise<FetchResult>;
};

const lookupTextFormula = (labels: string[], issues: string[]): string => {
  const labelConditionals = labels.map(
    label => `FIND("${label}", ARRAYJOIN(Labels))`
  );
  const issueConditionals = issues.map(
    issue => `FIND("${issue}", ARRAYJOIN(Issues))`
  );

  const conditionals = labelConditionals.concat(issueConditionals).join(', ');

  if (!conditionals) {
    return '1';
  }

  const finalFormula = `IF(OR(${conditionals}),1,0)`;
  return finalFormula;
};

const init = (API_KEY: string, BASE_ID: string): AirtableRest => {
  try {
    const base = new Airtable({apiKey: API_KEY}).base(BASE_ID);
    const automatedReviewTable = base('Automated Review Association');

    return {
      fetchProblemTags: async (
        labels: string[],
        issues: string[]
      ): Promise<FetchResult> => {
        const formula = lookupTextFormula(labels, issues);

        const fetchResult: Promise<FetchResult> = new Promise(
          (resolve, reject) => {
            const categorySet = new Set<string>();
            const tagMap = {} as CategoryTagMap;

            automatedReviewTable
              .select({
                fields: ['Name', 'Category'],
                filterByFormula: formula,
              })
              .eachPage(
                (records, fetchNextPage) => {
                  records.forEach(record => {
                    const tag = record.get('Name');
                    const category = record.get('Category');

                    if (
                      typeof tag === 'string' &&
                      typeof category === 'string'
                    ) {
                      categorySet.add(category);

                      if (tagMap.hasOwnProperty(category)) {
                        const prev = tagMap[category];
                        tagMap[category] = [...prev, tag];
                      } else {
                        tagMap[category] = [tag];
                      }
                    }
                  });

                  fetchNextPage();
                },
                err => {
                  if (err) {
                    reject(err);
                  }
                  resolve({categorySet, tagMap});
                }
              );
          }
        );

        return fetchResult;
      },
    };
  } catch (err) {
    throw err;
  }
};

export default {init};
