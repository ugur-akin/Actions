interface IStringSection {
  start: number;
  end: number;
  body: string;
  lines: string[];
}

export interface IStringSectionTitle {
  stripped: string;
  line: number;
  raw: string;
  suffix?: string;
}

export type SectionType = 'required' | 'frontend' | 'backend' | 'optional';

// TODO: Non-negaive integer type for line numbers?
//       https://stackoverflow.com/a/69413070/15220729
export type ITemplateSection = IStringSection &
  (
    | {
        generic: true;
      }
    | {
        generic: false;
        title: IStringSectionTitle;
        type: SectionType;
      }
  );

export interface IPullBodySection extends IStringSection {
  templateSection?: ITemplateSection;
  title: IStringSectionTitle;
  start: number;
}

export interface ISectionOccurance {
  line: number;
  section: ITemplateSection | undefined;
}
