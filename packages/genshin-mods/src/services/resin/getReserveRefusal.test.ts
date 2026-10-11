import { describe, expect, test } from "vitest";

import type { ReserveWindow } from "../../../types";

import { RESERVE_REFUSAL_INSTRUCTION } from "../constants";
import { InitialState } from "../InitialState";
import { getReserveRefusal } from "./getReserveRefusal";
import { getReserveSummary } from "./getReserveSummary";

describe(getReserveRefusal, () => {
  const resetsAt = new Date(0).toISOString();
  const maintenance: ReserveWindow = { isWindDown: false, name: "five-hour", percentage: 80, resetsAt };
  const windDown: ReserveWindow = { isWindDown: true, name: "weekly", percentage: 90, resetsAt };

  test.each([
    ["a haiku agent in maintenance", "Agent", { model: "haiku" }, maintenance, false],
    ["a haiku agent in wind-down", "Agent", { model: "haiku" }, windDown, false],
    ["an inheriting agent in maintenance", "Agent", {}, maintenance, true],
    ["an inheriting agent in wind-down", "Agent", {}, windDown, true],
    ["an opus agent", "Agent", { model: "opus" }, maintenance, true],
    ["a fork", "Agent", { subagent_type: "fork" }, windDown, true],
    ["a fork naming haiku", "Agent", { model: "haiku", subagent_type: "fork" }, maintenance, true],
    ["a workflow in maintenance", "Workflow", {}, maintenance, true],
    ["a workflow in wind-down", "Workflow", {}, windDown, true],
    ["a message to a running agent", "SendMessage", {}, windDown, false],
    ["an inheriting agent with no reserve", "Agent", {}, InitialState.reserveWindow, false],
    ["a workflow with no reserve", "Workflow", {}, InitialState.reserveWindow, false],
  ])("%s", (_description, toolName, launch, reserveWindow, isRefused) => {
    expect.hasAssertions();

    expect(getReserveRefusal(toolName, launch, reserveWindow)).toBe(
      isRefused ? `${getReserveSummary(reserveWindow)}. ${RESERVE_REFUSAL_INSTRUCTION}` : undefined,
    );
  });
});
