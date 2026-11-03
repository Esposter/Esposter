import { SurveyExpressionTokenType } from "#src/models/SurveyExpressionTokenType";
import { tokenizeSurveyExpression } from "#src/services/tokenizeSurveyExpression";
import { noop } from "@esposter/shared";
import { ok } from "neverthrow";
import { describe, expect, test } from "vitest";

// The tokens before the end token, as a type and a text each, so a case reads what the source became. A fault comes
// Back as it is, so a mismatch shows the fault
const getTokenPairs = (source: string) =>
  tokenizeSurveyExpression(source).match(
    (tokens) =>
      tokens
        .filter((token) => token.type !== SurveyExpressionTokenType.End)
        .map((token): [SurveyExpressionTokenType, string] => [token.type, token.text]),
    (error) => error,
  );

const getTokenError = (source: string) => tokenizeSurveyExpression(source).match(noop, (error) => error);

describe(tokenizeSurveyExpression, () => {
  const tokenCases: [string, string, [SurveyExpressionTokenType, string][]][] = [
    ["a whole number", "12", [[SurveyExpressionTokenType.Number, "12"]]],
    ["a number with a fraction", "1.5", [[SurveyExpressionTokenType.Number, "1.5"]]],
    ["a number that starts with a dot", ".5", [[SurveyExpressionTokenType.Number, ".5"]]],
    ["a string in single quotes", "'a b'", [[SurveyExpressionTokenType.String, "a b"]]],
    ["a string in double quotes", `"it's"`, [[SurveyExpressionTokenType.String, "it's"]]],
    ["a string escaping its quote", String.raw`'it\'s'`, [[SurveyExpressionTokenType.String, "it's"]]],
    ["a string escaping its backslash", String.raw`"a\\b"`, [[SurveyExpressionTokenType.String, String.raw`a\b`]]],
    [
      "a backslash before any other character",
      String.raw`'a\nb'`,
      [[SurveyExpressionTokenType.String, String.raw`a\nb`]],
    ],
    ["a reference", "{age}", [[SurveyExpressionTokenType.Reference, "age"]]],
    [
      "a reference with dots and spaces",
      "{panel.first name}",
      [[SurveyExpressionTokenType.Reference, "panel.first name"]],
    ],
    ["a boolean in any case", "TRUE", [[SurveyExpressionTokenType.Boolean, "true"]]],
    ["an identifier, its case kept", "nosuchFunction", [[SurveyExpressionTokenType.Identifier, "nosuchFunction"]]],
    ["a keyword operator in any case", "NotContains", [[SurveyExpressionTokenType.Operator, "notcontains"]]],
    ["a symbol operator", "!=", [[SurveyExpressionTokenType.Operator, "!="]]],
    [
      "the longest symbol read first",
      "1<=2",
      [
        [SurveyExpressionTokenType.Number, "1"],
        [SurveyExpressionTokenType.Operator, "<="],
        [SurveyExpressionTokenType.Number, "2"],
      ],
    ],
    [
      "a symbol read as the one before it when no longer one fits",
      "1<-2",
      [
        [SurveyExpressionTokenType.Number, "1"],
        [SurveyExpressionTokenType.Operator, "<"],
        [SurveyExpressionTokenType.Operator, "-"],
        [SurveyExpressionTokenType.Number, "2"],
      ],
    ],
    [
      "punctuation",
      "([,])",
      [
        [SurveyExpressionTokenType.Punctuation, "("],
        [SurveyExpressionTokenType.Punctuation, "["],
        [SurveyExpressionTokenType.Punctuation, ","],
        [SurveyExpressionTokenType.Punctuation, "]"],
        [SurveyExpressionTokenType.Punctuation, ")"],
      ],
    ],
    [
      "a comparison between a reference and a number",
      "{age} >= 18",
      [
        [SurveyExpressionTokenType.Reference, "age"],
        [SurveyExpressionTokenType.Operator, ">="],
        [SurveyExpressionTokenType.Number, "18"],
      ],
    ],
  ];

  test.each(tokenCases)("%s is one token", (_title, source, pairs) => {
    expect.hasAssertions();

    expect(getTokenPairs(source)).toStrictEqual(pairs);
  });

  test("each token is positioned at its first character, and the end token at the source's length", () => {
    expect.hasAssertions();

    expect(tokenizeSurveyExpression("{a} >= .5")).toStrictEqual(
      ok([
        { position: 0, text: "a", type: SurveyExpressionTokenType.Reference },
        { position: 4, text: ">=", type: SurveyExpressionTokenType.Operator },
        { position: 7, text: ".5", type: SurveyExpressionTokenType.Number },
        { position: 9, text: "", type: SurveyExpressionTokenType.End },
      ]),
    );
  });

  const errorCases: [string, string, string, number][] = [
    ["an unclosed string", "'abc", "Expected ' to close the string opened here", 4],
    ["an unclosed reference", "{age", "Expected } to close the reference opened here", 4],
    ["an empty reference", "{}", "Expected a question name between { and }", 1],
    ["a reference of spaces alone", "{ }", "Expected a question name between { and }", 2],
    ["a character no token starts with", "1 | 2", "Unexpected character |", 2],
    ["a dot with no digit after it", "1.", "Unexpected character .", 1],
  ];

  test.each(errorCases)("%s is an error", (_title, source, message, position) => {
    expect.hasAssertions();

    expect(getTokenError(source)).toStrictEqual({ message, position });
  });
});
