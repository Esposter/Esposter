import type { AnsweredCommit } from "#src/models/coderabbit/collect/AnsweredCommit";

import { ANSWERS_TRAILER, DRAINS_TRAILER } from "#src/services/coderabbit/collect/constants";
import { getTrailerValues } from "#src/services/coderabbit/collect/getTrailerValues";
import { checkIsGitHubNumber } from "#src/services/shared/checkIsGitHubNumber";
import { FIELD_SEPARATOR, RECORD_SEPARATOR } from "#src/services/shared/constants";

const getIds = (body: string, key: string): number[] =>
  getTrailerValues(body, key)
    .map(Number)
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
