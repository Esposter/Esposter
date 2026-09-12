import type { AnsweredCommit } from "#src/models/coderabbit/collect/AnsweredCommit";

// The `git log` format `readAnsweredCommits` asks for: records separated by the ASCII record separator, fields
// By the unit separator, trailer values by a comma. Control characters rather than newlines because a subject
// Or a trailer value is free text and a newline-delimited format would need a quoting rule.
export const RECORD_SEPARATOR = "";

export const FIELD_SEPARATOR = "";

const VALUE_SEPARATOR = ",";

const getIds = (values: string): number[] =>
  values
    .split(VALUE_SEPARATOR)
    .map((value) => Number(value.trim()))
    .filter((id) => Number.isSafeInteger(id) && id > 0);

export const getAnsweredCommits = (log: string): AnsweredCommit[] =>
  log
    .split(RECORD_SEPARATOR)
    .map((record) => record.trim())
    .filter(Boolean)
    .map((record) => {
      const [sha = "", subject = "", answers = "", drains = ""] = record.split(FIELD_SEPARATOR);
      return { answers: getIds(answers), drains: getIds(drains), sha, subject };
    })
    .filter(({ answers, drains }) => answers.length > 0 || drains.length > 0);
