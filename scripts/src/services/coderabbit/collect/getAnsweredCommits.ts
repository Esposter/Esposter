import type { AnsweredCommit } from "#src/models/coderabbit/collect/AnsweredCommit";

import {
  ANSWERS_TRAILER,
  DRAINS_TRAILER,
  FIELD_SEPARATOR,
  RECORD_SEPARATOR,
} from "#src/services/coderabbit/collect/constants";

const VALUE_SEPARATOR = ",";

// The whole body is scanned rather than `%(trailers:key=…)`, which reads only the **last** contiguous block of
// Trailer lines. Every commit here ends with the attribution line, and a blank line before it starts a new block
// — so an `Answers:` line written a paragraph earlier is invisible to git's own parser, and the finding it names
// Reads as open. It is then drained a second time: a Claude session spent re-fixing what the queue already
// Carries, and a second reply on the thread. The line means the same thing wherever the author put it.
const getIds = (body: string, key: string): number[] =>
  [...body.matchAll(new RegExp(String.raw`^[ \t]*${key}:(?<values>.*)$`, "gimu"))]
    .flatMap(({ groups }) => (groups?.values ?? "").split(VALUE_SEPARATOR))
    .map((value) => Number(value.trim()))
    .filter((id) => Number.isSafeInteger(id) && id > 0);

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
