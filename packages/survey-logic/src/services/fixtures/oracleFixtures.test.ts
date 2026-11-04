import type { SurveyLogicError } from "#src/models/SurveyLogicError";
import type { SurveyLogicStoredValue } from "#src/models/SurveyLogicStoredValue";
import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";
import type { Result } from "neverthrow";

import oracleFixtures from "#src/services/fixtures/oracleFixtures.json" with { type: "json" };
import { TEST_CONTEXT } from "#src/services/functions/constants.test";
import { runSurveyExpression } from "#src/services/runSurveyExpression";
import { describe, expect, test } from "vitest";

// Each row is an expression, the answers it reads and the value SurveyJS's expression runner gives for them.
// The rows were recorded at a fixed clock by a throwaway script that is not committed, so the rows are what stays.
// A row the package answers differently on purpose has a deviation: the value the package gives and the rule for it.
// Each row is replayed against that value, so a change to the package is noticed.
interface EncodedValue {
  fields?: Record<string, EncodedValue>;
  items?: EncodedValue[];
  message?: string;
  type: string;
  value?: boolean | number | string;
}

interface OracleFixture {
  answers: Record<string, SurveyLogicStoredValue>;
  deviation?: { ours: EncodedValue; rule: string };
  expression: string;
  value: EncodedValue;
}

const encodeNumber = (value: number): EncodedValue => {
  if (Object.is(value, -0)) return { type: "number", value: "-0" };
  if (Number.isNaN(value)) return { type: "number", value: "NaN" };
  if (!Number.isFinite(value)) return { type: "number", value: value > 0 ? "Infinity" : "-Infinity" };

  return { type: "number", value };
};

// A value as the fixtures record it, so NaN, minus zero, an unanswered value and each kind of value are told apart
const encodeSurveyLogicValue = (value: SurveyLogicValue): EncodedValue => {
  if (value === undefined) return { type: "undefined" };
  if (value === null) return { type: "null" };
  if (typeof value === "number") return encodeNumber(value);
  if (typeof value === "string") return { type: "string", value };
  if (typeof value === "boolean") return { type: "boolean", value };
  if (Array.isArray(value)) return { items: value.map((item) => encodeSurveyLogicValue(item)), type: "list" };

  return {
    fields: Object.fromEntries(Object.entries(value).map(([key, field]) => [key, encodeSurveyLogicValue(field)])),
    type: "record",
  };
};

const encodeResult = (result: Result<SurveyLogicValue, SurveyLogicError>): EncodedValue =>
  result.match(encodeSurveyLogicValue, (error) => ({ message: error.message, type: "error" }));

const replay = (expression: string, answers: Record<string, SurveyLogicStoredValue>): EncodedValue =>
  encodeResult(runSurveyExpression(expression, { ...TEST_CONTEXT, values: answers }));

describe("the oracle fixtures", () => {
  // The reason each rule of the language gives for its deviations, named by the rule's key in the fixtures
  const RULE_REASONS: Record<string, string> = {
    "accepted-syntax":
      "The package accepts `not`, a minus before any operand and a leading-dot number, which SurveyJS refuses",
    "aggregate-skip":
      "Aggregates skip what is not a value: an empty, non-numeric or record item is not counted, and an average, minimum or maximum of nothing is undefined",
    "answer-type":
      "An answer keeps its stored type: a text spelling a boolean or wrapped in quotes stays text, where SurveyJS reads the spelled boolean or the unquoted text",
    "array-filter": "The filter form of an array function is refused, so the package answers empty",
    "case-sensitive": "Names are case-sensitive here, where SurveyJS ignores case",
    "date-time-end":
      "SurveyJS answers NaN for a date-time end with an hours, minutes or seconds unit; this package answers the real difference",
    "power-grouping":
      "Power groups to the right: a chain of `^` is read from its last power, where SurveyJS groups the chain to the left",
    "unary-minus":
      "A unary minus binds looser than `^`, so `-2 ^ 2` is the negation of a square, where SurveyJS squares a negation",
    "numbers-compare":
      "Two values that read as numbers compare as numbers, so `'10' < '9'` is false and `'5.0' = '5'` is true, where SurveyJS compares the texts",
    "text-identity":
      "Texts are equal only when they are identical, with no trimming and no change of case, where SurveyJS trims and ignores case",
    "empty-equality":
      "Empty values equal each other, so an empty list or record equals an unanswered value and an empty text, where SurveyJS does not",
    "boolean-equality":
      "A boolean equals only the same boolean, so `false` is not zero, a text spelling `true` is not `true`, and a list holding a number does not hold `true`, where SurveyJS equates them",
    "unordered-values":
      "An empty value, or a number against a text that is not a number, is never ordered, where SurveyJS orders them as zero or as text",
    "falsy-needle": "A needle of zero or false matches like any other value, where SurveyJS treats it as empty",
    "negated-containment":
      "`notcontains` is the negation of `contains`, so an empty needle or an unanswered haystack is not contained and `notcontains` holds, where SurveyJS gives false",
    "empty-needle-list": "`anyof` of an empty list is false, where SurveyJS gives true for any answer",
    "logic-boolean":
      "`and` and `or` are boolean: an operand counts only when it is `true`, so the result is `true` or `false`, where SurveyJS gives the operand that decides the result",
    "condition-true":
      "`iif` takes its second value only when its condition is `true`, so a number or text condition takes the third value, where SurveyJS takes any truthy condition",
    "numeric-arithmetic":
      "Arithmetic is numeric: an empty, boolean, list or record operand has no result, `+` joins only two texts that are not numbers, and a division or remainder by zero has none",
    "one-absent-value":
      "One absent value: an operation with no result, an unanswered operand or an invalid date is undefined, where SurveyJS gives null, NaN or an invalid date",
    "one-number-reading":
      "One text-to-number rule: a text is a number only as a plain decimal, so a hexadecimal, binary, octal or comma-decimal text stays text, and an answer keeps its text until an operation asks for a number",
    "text-function": "Text functions read their index as a number: a substring index that is not a number has no part",
  };

  const fixtures: readonly OracleFixture[] = oracleFixtures;

  test.each(fixtures)("$expression", ({ answers, deviation, expression, value }) => {
    expect.hasAssertions();

    expect(replay(expression, answers)).toStrictEqual(deviation?.ours ?? value);
  });

  // A deviation the package no longer has is removed from its row, so a row states only what still differs
  test("every deviation names a rule and still differs from SurveyJS", () => {
    expect.hasAssertions();

    for (const { deviation, value } of fixtures) {
      if (deviation === undefined) continue;

      expect(Object.keys(RULE_REASONS)).toContain(deviation.rule);
      expect(deviation.ours).not.toStrictEqual(value);
    }
  });
});
