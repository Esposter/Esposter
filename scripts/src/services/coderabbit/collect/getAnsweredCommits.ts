import type { AnsweredCommit } from "#src/models/coderabbit/collect/AnsweredCommit";

import { ANSWERS_TRAILER, DRAINS_TRAILER } from "#src/services/coderabbit/collect/constants";
import { checkIsGitHubNumber } from "#src/services/coderabbit/shared/checkIsGitHubNumber";
import { FIELD_SEPARATOR, RECORD_SEPARATOR } from "#src/services/shared/constants";

const VALUE_SEPARATOR = ",";

// The whole body rather than `%(trailers:key=…)`, which reads only the last contiguous trailer block: every
// Commit ends with the attribution line, so an `Answers:` line a paragraph earlier would read as open
const getIds = (body: string, key: string): number[] =>
  [...body.matchAll(new RegExp(String.raw`^[ \t]*${key}:(?<values>.*)$`, "gimu"))]
    .flatMap(({ groups }) => (groups?.values ?? "").split(VALUE_SEPARATOR))
    .map((value) => Number(value.trim()))
    .filter((id) => checkIsGitHubNumber(id));

export const getAnsweredCommits = (log: string): AnsweredCommit[] =>
  log
    .split(RECORD_SEPARATOR)
    .map((record) => record.trim())
    .filter(Boolean)
    .map((record) => {
      const [sha = "", subject = "", body = ""] = record.split(FIELD_SEPARATOR);
      return { answers: getIds(body, ANSWERS_TRAILER), drains: getIds(body, DRAINS_TRAILER), sha, subject };
    })
    .filter(({ answers, drains }) => answers.length > 0 || drains.length > 0);
