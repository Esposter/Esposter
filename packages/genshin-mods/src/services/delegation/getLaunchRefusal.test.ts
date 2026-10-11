import { describe, expect, test } from "vitest";

import { AGENT_MODEL_REFUSAL } from "../constants";
import { getLaunchRefusal } from "./getLaunchRefusal";

describe(getLaunchRefusal, () => {
  test.each([
    ["a haiku agent", { model: "haiku" }, undefined],
    ["an inheriting agent", {}, AGENT_MODEL_REFUSAL],
    ["an opus agent", { model: "opus" }, AGENT_MODEL_REFUSAL],
    ["a sonnet agent", { model: "sonnet" }, AGENT_MODEL_REFUSAL],
    ["a fork naming haiku", { model: "haiku", subagent_type: "fork" }, AGENT_MODEL_REFUSAL],
  ])("%s", (_description, launch, refusal) => {
    expect.hasAssertions();

    expect(getLaunchRefusal(launch)).toBe(refusal);
  });
});
