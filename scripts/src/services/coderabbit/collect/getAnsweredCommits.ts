import type { AnsweredCommit } from "#src/models/coderabbit/collect/AnsweredCommit";

import { ANSWERS_TRAILER, DRAINS_TRAILER } from "#src/services/coderabbit/collect/constants";
import { getTrailerValues } from "#src/services/coderabbit/collect/getTrailerValues";
import { checkIsGitHubNumber } from "#src/services/shared/checkIsGitHubNumber";
import { getGitRecords } from "#src/services/shared/getGitRecords";

const getIds = (body: string, key: string): number[] =>
  getTrailerValues(body, key)
    .map(Number)
    .filter((id) => checkIsGitHubNumber(id));

export const getAnsweredCommits = (log: string): AnsweredCommit[] =>
  getGitRecords(log)
    .map(([sha = "", subject = "", body = ""]) => ({
      answers: getIds(body, ANSWERS_TRAILER),
      drains: getIds(body, DRAINS_TRAILER),
      sha,
      subject,
    }))
    .filter(({ answers, drains }) => answers.length > 0 || drains.length > 0);
