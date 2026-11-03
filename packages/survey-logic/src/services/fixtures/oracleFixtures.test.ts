import type { SurveyLogicError } from "#src/models/SurveyLogicError";
import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";
import type { Result } from "neverthrow";

import { TEST_CONTEXT } from "#src/services/functions/constants.test";
import oracleFixtures from "#src/services/fixtures/oracleFixtures.json" with { type: "json" };
import { runSurveyExpression } from "#src/services/runSurveyExpression";
import { describe, expect, test } from "vitest";

// Each case is an expression, the answers it reads and the value SurveyJS's expression runner gives for them at the
// Test clock. The fixtures were recorded by a throwaway script outside the repository, which is not committed, so the
// Fixtures are what stays. A case the package answers differently on purpose is in the known deviations below, and is
// Replayed against the package's own value so a change to it is noticed
interface EncodedValue {
  fields?: Record<string, EncodedValue>;
  items?: EncodedValue[];
  message?: string;
  type: string;
  value?: boolean | number | string;
}

interface OracleFixture {
  answers: Record<string, SurveyLogicValue>;
  expression: string;
  value: EncodedValue;
}

interface KnownDeviation {
  answers: Record<string, SurveyLogicValue>;
  expression: string;
  // The package's own value, which the case is replayed against
  ours: SurveyLogicValue;
  reason: string;
  // SurveyJS's value in words, for the reader; the fixture holds the recorded value
  surveyJs: string;
}

const ACCEPTED_SYNTAX_REASON =
  "The package accepts `not`, a minus before any operand and a leading-dot number, which SurveyJS refuses";
const ARRAY_FILTER_REASON = "The filter form of an array function is refused, so the package answers empty";
const BINARY_EQUALITY_REASON =
  "SurveyJS's equality reads a binary or octal text inconsistently, where the package reads it as its number";
const CASE_SENSITIVE_REASON = "Names are case-sensitive here, where SurveyJS ignores case";
const DATE_TEXT_AMOUNT_REASON =
  "A date amount that is numeric text is read as a number, where SurveyJS joins it as text";
const EMPTY_NULL_REASON = "An unanswered reference or an empty result is undefined, where SurveyJS gives null";
const INVALID_DATE_REASON = "A date SurveyJS cannot read is invalid, which the package answers as empty";
const RECORD_REASON = "A record holds no text and reads as no number, where SurveyJS joins its default text";
const SURVEYJS_THROWS_REASON =
  "SurveyJS throws on a text added to a sum that has decimals, where the package answers empty";

// The matrix the array-function cases read: its items hold numbers, texts that read as numbers or not, and a missing field
const ARRAY_ANSWERS: Record<string, SurveyLogicValue> = {
  a: 5,
  m: [{ p: 1, q: "x" }, { p: 2, q: "y" }, { p: "3", q: "z" }, { p: "x", q: "w" }, { q: "v" }],
};

const KNOWN_DEVIATIONS: readonly KnownDeviation[] = [
  { answers: {}, expression: ".5", ours: 0.5, reason: ACCEPTED_SYNTAX_REASON, surveyJs: "refused as invalid" },
  { answers: {}, expression: "-(3)", ours: -3, reason: ACCEPTED_SYNTAX_REASON, surveyJs: "refused as invalid" },
  { answers: {}, expression: "- 3", ours: -3, reason: ACCEPTED_SYNTAX_REASON, surveyJs: "refused as invalid" },
  { answers: {}, expression: "not 0", ours: true, reason: ACCEPTED_SYNTAX_REASON, surveyJs: "refused as invalid" },
  { answers: {}, expression: "not true", ours: false, reason: ACCEPTED_SYNTAX_REASON, surveyJs: "refused as invalid" },
  { answers: {}, expression: "{a}", ours: undefined, reason: EMPTY_NULL_REASON, surveyJs: "null" },
  {
    answers: ARRAY_ANSWERS,
    expression: "dateAdd('1970-01-01', 0)",
    ours: undefined,
    reason: EMPTY_NULL_REASON,
    surveyJs: "null",
  },
  { answers: {}, expression: "dateAdd('1970-01-01', 0)", ours: undefined, reason: EMPTY_NULL_REASON, surveyJs: "null" },
  {
    answers: ARRAY_ANSWERS,
    expression: "dateAdd('1970-01-01')",
    ours: undefined,
    reason: EMPTY_NULL_REASON,
    surveyJs: "null",
  },
  { answers: {}, expression: "dateAdd('1970-01-01')", ours: undefined, reason: EMPTY_NULL_REASON, surveyJs: "null" },
  {
    answers: { m: { row1: 5 } },
    expression: "{m.row1.col1}",
    ours: undefined,
    reason: EMPTY_NULL_REASON,
    surveyJs: "null",
  },
  { answers: { m: { x: null } }, expression: "{m.x.y}", ours: undefined, reason: EMPTY_NULL_REASON, surveyJs: "null" },
  { answers: { a: 5 }, expression: "{a.b}", ours: undefined, reason: EMPTY_NULL_REASON, surveyJs: "null" },
  { answers: {}, expression: "{a.b}", ours: undefined, reason: EMPTY_NULL_REASON, surveyJs: "null" },
  { answers: {}, expression: "{length}", ours: undefined, reason: EMPTY_NULL_REASON, surveyJs: "null" },
  { answers: { list: [1, 2] }, expression: "{list[5]}", ours: undefined, reason: EMPTY_NULL_REASON, surveyJs: "null" },
  { answers: { a: "xyz" }, expression: "{a[0]}", ours: undefined, reason: EMPTY_NULL_REASON, surveyJs: "null" },
  { answers: { m: { "0": 4 } }, expression: "{m[0]}", ours: undefined, reason: EMPTY_NULL_REASON, surveyJs: "null" },
  { answers: { m: [[1, 2]] }, expression: "{m[0][1]}", ours: undefined, reason: EMPTY_NULL_REASON, surveyJs: "null" },
  {
    answers: {
      m: [
        [1, 2],
        [3, 4],
      ],
    },
    expression: "{m[0][1]}",
    ours: undefined,
    reason: EMPTY_NULL_REASON,
    surveyJs: "null",
  },
  { answers: { m: [5] }, expression: "{m[0].q}", ours: undefined, reason: EMPTY_NULL_REASON, surveyJs: "null" },
  { answers: { m: [5] }, expression: "{m[1]}", ours: undefined, reason: EMPTY_NULL_REASON, surveyJs: "null" },
  {
    answers: { x: [{ y: 1 }] },
    expression: "{x[0].y[1]}",
    ours: undefined,
    reason: EMPTY_NULL_REASON,
    surveyJs: "null",
  },
  {
    answers: { panel: [{ q1: "x" }] },
    expression: "{panel[1].q1}",
    ours: undefined,
    reason: EMPTY_NULL_REASON,
    surveyJs: "null",
  },
  { answers: { a: "0b1" }, expression: "{a} = 0", ours: false, reason: BINARY_EQUALITY_REASON, surveyJs: "true" },
  { answers: { a: "0o7" }, expression: "{a} = 0", ours: false, reason: BINARY_EQUALITY_REASON, surveyJs: "true" },
  {
    answers: { a: { b: 1 } },
    expression: "{a} + 1",
    ours: Number.NaN,
    reason: RECORD_REASON,
    surveyJs: '"[object Object]1"',
  },
  {
    answers: { a: { b: 1 } },
    expression: "{a} + 'x'",
    ours: "x",
    reason: RECORD_REASON,
    surveyJs: '"[object Object]x"',
  },
  {
    answers: ARRAY_ANSWERS,
    expression: "sum({m})",
    ours: 0,
    reason: RECORD_REASON,
    surveyJs: '"0[object Object][object Object][object Object][object Object][object Object]"',
  },
  {
    answers: ARRAY_ANSWERS,
    expression: "sum(1.5, 'a')",
    ours: undefined,
    reason: SURVEYJS_THROWS_REASON,
    surveyJs: "throws: res.toFixed is not a function",
  },
  {
    answers: {},
    expression: "sum(1.5, 'a')",
    ours: undefined,
    reason: SURVEYJS_THROWS_REASON,
    surveyJs: "throws: res.toFixed is not a function",
  },
  {
    answers: ARRAY_ANSWERS,
    expression: "today('x')",
    ours: undefined,
    reason: INVALID_DATE_REASON,
    surveyJs: "an invalid date",
  },
  { answers: {}, expression: "today('x')", ours: undefined, reason: INVALID_DATE_REASON, surveyJs: "an invalid date" },
  {
    answers: ARRAY_ANSWERS,
    expression: "dateAdd('x', 1)",
    ours: undefined,
    reason: INVALID_DATE_REASON,
    surveyJs: "an invalid date",
  },
  {
    answers: {},
    expression: "dateAdd('x', 1)",
    ours: undefined,
    reason: INVALID_DATE_REASON,
    surveyJs: "an invalid date",
  },
  {
    answers: ARRAY_ANSWERS,
    expression: "today('3')",
    ours: "1970-01-05",
    reason: DATE_TEXT_AMOUNT_REASON,
    surveyJs: '"1970-01-23"',
  },
  {
    answers: {},
    expression: "today('3')",
    ours: "1970-01-05",
    reason: DATE_TEXT_AMOUNT_REASON,
    surveyJs: '"1970-01-23"',
  },
  {
    answers: ARRAY_ANSWERS,
    expression: "today(' 3 ')",
    ours: "1970-01-05",
    reason: DATE_TEXT_AMOUNT_REASON,
    surveyJs: "an invalid date",
  },
  {
    answers: {},
    expression: "today(' 3 ')",
    ours: "1970-01-05",
    reason: DATE_TEXT_AMOUNT_REASON,
    surveyJs: "an invalid date",
  },
  {
    answers: ARRAY_ANSWERS,
    expression: "today('1,5')",
    ours: "1970-01-03",
    reason: DATE_TEXT_AMOUNT_REASON,
    surveyJs: "an invalid date",
  },
  {
    answers: {},
    expression: "today('1,5')",
    ours: "1970-01-03",
    reason: DATE_TEXT_AMOUNT_REASON,
    surveyJs: "an invalid date",
  },
  {
    answers: ARRAY_ANSWERS,
    expression: "dateAdd('1970-01-01', '3')",
    ours: "1970-01-04",
    reason: DATE_TEXT_AMOUNT_REASON,
    surveyJs: '"1970-01-13"',
  },
  {
    answers: {},
    expression: "dateAdd('1970-01-01', '3')",
    ours: "1970-01-04",
    reason: DATE_TEXT_AMOUNT_REASON,
    surveyJs: '"1970-01-13"',
  },
  {
    answers: ARRAY_ANSWERS,
    expression: "dateAdd('1970-01-01', '3', 'days')",
    ours: "1970-01-04",
    reason: DATE_TEXT_AMOUNT_REASON,
    surveyJs: '"1970-01-13"',
  },
  {
    answers: {},
    expression: "dateAdd('1970-01-01', '3', 'days')",
    ours: "1970-01-04",
    reason: DATE_TEXT_AMOUNT_REASON,
    surveyJs: '"1970-01-13"',
  },
  {
    answers: ARRAY_ANSWERS,
    expression: "maxInArray({m}, 'p', 'q', '{p} > 1')",
    ours: undefined,
    reason: ARRAY_FILTER_REASON,
    surveyJs: '"z"',
  },
  {
    answers: ARRAY_ANSWERS,
    expression: "avgInArray({m}, 'p', '{p} > 1')",
    ours: undefined,
    reason: ARRAY_FILTER_REASON,
    surveyJs: "2.5",
  },
  {
    answers: { m: { a: { b: 1 } } },
    expression: "{m.A.b}",
    ours: undefined,
    reason: CASE_SENSITIVE_REASON,
    surveyJs: "1",
  },
  { answers: { m: { a: 1 } }, expression: "{m.A}", ours: undefined, reason: CASE_SENSITIVE_REASON, surveyJs: "1" },
  { answers: { m: { a: 1 } }, expression: "{M.a}", ours: undefined, reason: CASE_SENSITIVE_REASON, surveyJs: "1" },
  {
    answers: { list: [1, 2, 3] },
    expression: "{list.Length}",
    ours: undefined,
    reason: CASE_SENSITIVE_REASON,
    surveyJs: "null",
  },
  {
    answers: { name: "Ada" },
    expression: "{Name} = 'Ada'",
    ours: false,
    reason: CASE_SENSITIVE_REASON,
    surveyJs: "true",
  },
  { answers: { a: 1 }, expression: "{A}", ours: undefined, reason: CASE_SENSITIVE_REASON, surveyJs: "1" },
];

const fixtures: readonly OracleFixture[] = oracleFixtures;

const caseKey = (expression: string, answers: Readonly<Record<string, SurveyLogicValue>>): string =>
  JSON.stringify([expression, answers]);

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

const replay = (expression: string, answers: Record<string, SurveyLogicValue>): EncodedValue =>
  encodeResult(runSurveyExpression(expression, { ...TEST_CONTEXT, values: answers }));

describe("the oracle fixtures", () => {
  const knownDeviationByCase = new Map(
    KNOWN_DEVIATIONS.map((deviation) => [caseKey(deviation.expression, deviation.answers), deviation]),
  );

  test.each(fixtures)("$expression", ({ answers, expression, value }) => {
    expect.hasAssertions();

    const deviation = knownDeviationByCase.get(caseKey(expression, answers));
    expect(replay(expression, answers)).toStrictEqual(
      deviation === undefined ? value : encodeSurveyLogicValue(deviation.ours),
    );
  });

  test("every known deviation is a recorded case", () => {
    expect.hasAssertions();

    const recordedCases = new Set(fixtures.map((fixture) => caseKey(fixture.expression, fixture.answers)));
    expect(
      KNOWN_DEVIATIONS.filter((deviation) => !recordedCases.has(caseKey(deviation.expression, deviation.answers))),
    ).toStrictEqual([]);
  });

  // A deviation the package no longer has is removed from the list, so the list states only what still differs
  test("every known deviation still differs from SurveyJS", () => {
    expect.hasAssertions();

    const recordedValues = new Map(
      fixtures.map((fixture) => [caseKey(fixture.expression, fixture.answers), fixture.value]),
    );
    expect(
      KNOWN_DEVIATIONS.filter((deviation) => {
        const recorded = recordedValues.get(caseKey(deviation.expression, deviation.answers));
        return JSON.stringify(encodeSurveyLogicValue(deviation.ours)) === JSON.stringify(recorded);
      }),
    ).toStrictEqual([]);
  });
});
