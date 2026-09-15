import type { MergeRisk } from "#src/models/coderabbit/collect/MergeRisk";
import type { MergeRiskCoverage } from "#src/models/coderabbit/collect/MergeRiskCoverage";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { CODERABBIT_REST_LOGIN } from "#src/services/coderabbit/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { getResult } from "@esposter/shared";

const MERGE_RISK_LEVEL_REGEX = /\*\*Merge Risk:\*\* _\S+ (?<level>[^_]+)_/u;

const MERGE_RISK_COVERAGE_REGEX = /<!-- final_review_risk_coverage:(?<coverage>\{.*?\}) -->/u;

// The bot's walkthrough alone: the level is public text, and a forged one would release whatever it covers
export const getMergeRisk = (issueComments: GitHubEntry[]): MergeRisk | undefined => {
  for (const { body, user } of issueComments) {
    if (user.login !== CODERABBIT_REST_LOGIN) continue;
    const level = MERGE_RISK_LEVEL_REGEX.exec(body)?.groups?.level;
    const coverage = MERGE_RISK_COVERAGE_REGEX.exec(body)?.groups?.coverage;
    if (!level || !coverage) continue;
    // A block whose JSON this cannot read names no head, so it is no verdict: the release waits for the next
    // Review rather than the cycle dying on the comment — which every event after it would re-read and die on
    const coveredSha = getResult(() => parseMachineJson<MergeRiskCoverage>(coverage).coveredCommitId).unwrapOr(
      undefined,
    );
    if (coveredSha) return { coveredSha, level };
  }
  return undefined;
};
