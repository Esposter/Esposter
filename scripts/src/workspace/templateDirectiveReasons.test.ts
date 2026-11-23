import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";
import DIRECTIVE_REASON_REGEX from "@esposter/configuration/eslint/directiveReasonRegex.js";
import { describe, expect, test } from "vitest";

// The template half of oxlint's `comments/require-directive-reason`: oxlint reads only a component's script, and vize's
// Tree carries no comment, so a disable comment in a template is checked here, against the reason pattern oxlint's half
// Reads. An HTML comment opening with the directive is one, wherever it sits; prose naming a directive is not
describe("templateDirectiveReasons", () => {
  const DIRECTIVE_COMMENT_REGEX = /<!--\s*eslint-disable(?:-next-line|-line)?(?:\s(?<body>.*?))?-->/u;

  test("every template disable comment states its reason", () => {
    expect.hasAssertions();

    expect(
      getNonEmptyLines(runGit(["grep", "-n", "-E", String.raw`<!--\s*eslint-disable`, "--", "*.vue"])).filter(
        (grepLine) => {
          const match = DIRECTIVE_COMMENT_REGEX.exec(grepLine);
          return match !== null && !DIRECTIVE_REASON_REGEX.test(` ${match.groups?.body ?? ""} `);
        },
      ),
    ).toStrictEqual([]);
  });
});
