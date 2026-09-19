import type { ReviewThread } from "#src/models/coderabbit/shared/ReviewThread";

import { getFindingText } from "#src/services/coderabbit/collect/getFindingText";
import { readAnswers } from "#src/services/jev/readAnswers";
import { score } from "@typesafe-ai/sdk";

// The rubric the findings are ordered by. It reads the finding as written — the tier cannot open the file, and
// Whether the finding is true of this tree is the session's judgement, not this one's.
const SEVERITY_CRITERIA = [
  "Cosmetic: a nitpick, a praise note, a wording preference, or a style the repository has not stated a rule for.",
  "Real but bounded: a defect, a broken convention or a missing case, confined to the lines it names.",
  "Blocking: wrong behaviour, lost or corrupted data, a security hole, or a convention break the rest of the tree copies.",
] as const;

// A question is named for the finding it scores, which is how its answer is read back
const getQuestionName = (commentId: number): string => `finding${commentId}`;

// The order the drain meets its findings in. A session is one-shot and may end mid-round — on the limit, on a
// check it could not get green — so which finding it reaches first is the one thing about the prompt that
// survives a round that did not finish. Nothing here acts on an answer and nothing is dropped: every finding
// still reaches the session, so the confidence floor that gates an action does not apply, and a wrong order
// costs the ordering alone. One finding cannot be out of order, so it is not asked about.
export const readFindingSeverities = async (openThreads: ReviewThread[]): Promise<Map<number, number> | undefined> => {
  if (openThreads.length < 2) return undefined;

  const state = openThreads.map(({ body, commentId, line, path }) => ({
    finding: getFindingText(body),
    id: commentId,
    location: `${path}:${line ?? "outside the diff"}`,
  }));
  const questions = Object.fromEntries(
    openThreads.map(({ commentId }) => [
      getQuestionName(commentId),
      score(`How severe is the finding whose id is ${commentId}?`, SEVERITY_CRITERIA),
    ]),
  );
  const answers = await readAnswers(state, questions);
  if (answers === undefined) return undefined;

  return new Map(
    openThreads.map(({ commentId }) => [commentId, answers[getQuestionName(commentId)]?.score ?? 0] as const),
  );
};
