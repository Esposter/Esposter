import { jsonDateParse } from "@esposter/shared";
import { readFileSync } from "node:fs";

// A string literal is matched whole and kept, so a comment marker or a comma inside one
// (a route pattern, say) is never read as one.
const COMMENT_REGEX = /(?<literal>"(?:[^"\\]|\\.)*")|\/\/[^\n]*|\/\*[\s\S]*?\*\//gu;
const TRAILING_COMMA_REGEX = /(?<literal>"(?:[^"\\]|\\.)*")|,(?<closing>\s*[}\]])/gu;

// A wrangler.jsonc read as its parsed object.
// The file is JSONC: its comments and the trailing commas the formatter keeps are removed first.
// Since JSON.parse refuses both, they must go.
// oxlint-disable-next-line typescript/no-unnecessary-type-parameters -- the caller names it, as jsonDateParse does
export const readWranglerConfiguration = <Configuration>(path: string): Configuration =>
  jsonDateParse<Configuration>(
    readFileSync(path, "utf8")
      .replaceAll(COMMENT_REGEX, (_match: string, literal: string | undefined) => literal ?? "")
      .replaceAll(
        TRAILING_COMMA_REGEX,
        (match: string, _literal: string | undefined, closing: string | undefined) => closing ?? match,
      ),
  );
