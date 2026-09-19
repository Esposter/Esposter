import type { EntryType, Questions, SystemOneResult } from "@typesafe-ai/sdk";

import { getResult, getResultAsync } from "@esposter/shared";
import { TypeSafeClient } from "@typesafe-ai/sdk";

// The constructor reads `TYPESAFE_API_KEY` and throws without it, which is how a checkout holding no key reads:
// Every gate then answers nothing and its caller escalates, rather than a run failing over a decision the tier
// Above it can still make. Built once — the client is a configuration holder, and a gate asked per finding would
// Otherwise re-read the environment for each.
const client = getResult(() => new TypeSafeClient()).match(
  (typeSafeClient) => typeSafeClient,
  () => undefined,
);

// One round trip per state, however many questions are asked of it: the state is sent once and each answer comes
// back under its own key, so a second call for a second question would be the same state paid for twice.
// Nothing here throws or retries — the SDK retries its own transport, and what it cannot answer is answered a
// tier up (`llm-delegation` skill).
export const readAnswers = async <const TQuestions extends Questions>(
  state: EntryType,
  questions: TQuestions,
): Promise<SystemOneResult<TQuestions>["answers"] | undefined> => {
  if (client === undefined) {
    console.info("no TypeSafe key in this environment — the decision escalates");
    return undefined;
  }

  const result = await getResultAsync(() => client.systemOne({ questions, state }));
  return result.match(
    ({ answers, usage }) => {
      console.info(`jev answered ${Object.keys(questions).length} questions on ${usage.input_tokens} input tokens`);
      return answers;
    },
    (error) => {
      console.error(error);
      return undefined;
    },
  );
};
