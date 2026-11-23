import type { PollMessageContent } from "@esposter/db-schema";

import { v7 } from "uuid";
import { describe } from "vitest";

// A poll as its sender composes it: `optionCount` options labelled in order, and any part a test names replacing the
// Default
export const createPollMessageContent = (
  optionCount: number,
  overrides: Partial<PollMessageContent> = {},
): PollMessageContent => ({
  options: Array.from({ length: optionCount }, (_value, index) => ({ id: v7(), label: `Option ${index}` })),
  question: "a",
  votes: {},
  ...overrides,
});

describe.todo("createPollMessageContent");
