import {
  getSectionTypeFromSuffix,
  getTemplateSections,
  isLetter,
  startsWithCapitalizedLetter,
} from '../../src/reviewer';
import {expect, test, describe} from '@jest/globals';
import deepEqual from 'deep-equal';
import {templateSample} from '../samples';
import _ from 'underscore';

const spChars = ['-', '.', '/', '\\', '*', '$', '*', '#', '%', '_'];
const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const ws = [' ', '\n', '\t', '\r'];
const smUpEngChars = ['A', 'E', 'W', 'Z', 'I', 'U'];
const smLoEngChars = ['a', 'r', 'w', 'y', 'i', 'x', 'z'];

describe('IsLetter util', () => {
  test.each(['', '..'])('throws on length !== 1', str => {
    expect(() => isLetter(str)).toThrow();
  });

  test.each(digits.map(d => d.toString()))('returns false on numbers', c => {
    expect(isLetter(c)).toBe(false);
  });

  test.each(spChars)('returns false special characters', c => {
    expect(isLetter(c)).toBe(false);
  });

  test.each(ws)('returns false on whitespace', c => {
    expect(isLetter(c)).toBe(false);
  });

  test.each(smLoEngChars)('returns true on lowercase english characters', c => {
    expect(isLetter(c)).toBe(true);
  });
  test.each(smUpEngChars)('returns true on uppercase english characters', c => {
    expect(isLetter(c)).toBe(true);
  });
});

describe('StartsWithCapitalizedLetter util', () => {
  const testString =
    "I'm a test string that may or may not start with a capitalized letter.";
  // empty, number,  whitespace, special, cap, reg
  test('returns false on empty string', () => {
    expect(startsWithCapitalizedLetter('')).toBe(false);
  });
  test.each(digits.map(num => num.toString() + testString))(
    'returns false on number',
    str => {
      expect(startsWithCapitalizedLetter(str)).toBe(false);
    }
  );
  test.each(spChars.map(spChar => spChar + testString))(
    'returns false on special characters',
    str => {
      expect(startsWithCapitalizedLetter(str)).toBe(false);
    }
  );

  test.each(smLoEngChars.map(lo => lo + testString))(
    'returns false on lowercase letters',
    str => {
      expect(startsWithCapitalizedLetter(str)).toBe(false);
    }
  );
  test.each(smUpEngChars.map(up => up + testString))(
    'returns true on uppercase letters',
    str => {
      expect(startsWithCapitalizedLetter(str)).toBe(true);
    }
  );
});

describe('GetSectionTypeFromSuffix util', () => {
  test('should return "optional" on "undefined"', () => {
    expect(getSectionTypeFromSuffix(undefined)).toBe('optional');
  });
  test.each(['(Required):', '(requiRed)'])(
    'should return "required" if it appears in suffix',
    suffix => {
      expect(getSectionTypeFromSuffix(suffix)).toBe('required');
    }
  );
  test.each(['(Front-end Only):', ' (frOntEnd_):'])(
    'should return "frontend" if it appears in suffix',
    suffix => {
      expect(getSectionTypeFromSuffix(suffix)).toBe('frontend');
    }
  );
  test.each(['(Back-end Only):', '(bAckEnD _)'])(
    'should return "backend" if it appears in suffix',
    suffix => {
      expect(getSectionTypeFromSuffix(suffix)).toBe('backend');
    }
  );

  test.each(['(fronend)', '(f): ', '(Backa):', ' '])(
    'should default to "optional" on unrecognized',
    suffix => {
      expect(getSectionTypeFromSuffix(suffix)).toBe('optional');
    }
  );
});

describe('GetTemplateSections util', () => {
  test('should match sample', () => {
    const {raw: templateStr, sections: actualSections} = templateSample;
    const splitSections = getTemplateSections(templateStr);

    expect(deepEqual(actualSections, splitSections, {strict: true})).toBe(true);
  });
});
