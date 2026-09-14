import type { MergeRisk } from "#src/models/coderabbit/collect/MergeRisk";
import type { MergeRiskCoverage } from "#src/models/coderabbit/collect/MergeRiskCoverage";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { CODERABBIT_REST_LOGIN } from "#src/services/coderabbit/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";

const MERGE_RISK_LEVEL_REGEX = /\*\*Merge Risk:\*\* _\S+ (?<level>[^_]+)_/u;

const MERGE_RISK_COVERAGE_REGEX = /<!-- final_review_risk_coverage:(?<coverage>\{.*?\}) -->/u;

// The bot's walkthrough alone: the level is public text, and a forged one would release whatever it covers
export const getMergeRisk = (issueComments: GitHubEntry[]): MergeRisk | undefined => {
  for (const { body, user } of issueComments) {
    if (user.login !== CODERABBIT_REST_LOGIN) continue;
    const level = MERGE_RISK_LEVEL_REGEX.exec(body)?.groups?.level;
    const coverage = MERGE_RISK_COVERAGE_REGEX.exec(body)?.groups?.coverage;
    if (level && coverage) return { coveredSha: parseMachineJson<MergeRiskCoverage>(coverage).coveredCommitId, level };
  }
  return undefined;
};
