import type { MainCheck } from "#src/models/coderabbit/collect/MainCheck";

import { CI_FAILURE_CONCLUSION, CI_SUCCESS_CONCLUSION } from "#src/services/coderabbit/collect/constants";

// Whether a run reached a verdict, green or red — a run cancelled while it waited behind another ran no job, and one
// Still going has said nothing yet
export const checkIsVerdict = ({ conclusion }: MainCheck): boolean =>
  conclusion === CI_SUCCESS_CONCLUSION || conclusion === CI_FAILURE_CONCLUSION;
