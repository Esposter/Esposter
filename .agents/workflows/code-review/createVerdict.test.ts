import { describe } from "vitest";

import { VERDICT_DEFAULT } from "./constants.test";

/** One verifier verdict for the candidate at `index`, with whatever the suite varies about it applied last. */
export const createVerdict = (index: number, overrides: Record<string, unknown>): Record<string, unknown> => ({
  index,
  verdict: "CONFIRMED",
  ...VERDICT_DEFAULT,
  ...overrides,
});

describe.todo("createVerdict");
