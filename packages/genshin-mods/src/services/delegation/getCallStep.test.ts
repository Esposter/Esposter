import { describe, expect, test } from "vitest";

import { DelegationStep } from "../../models/DelegationStep";
import { getCallStep } from "./getCallStep";

describe(getCallStep, () => {
  test.each([
    ["Read", { tool: "Read" }],
    ["Grep", { tool: "Grep" }],
    ["Glob", { tool: "Glob" }],
    ["WebFetch", { tool: "WebFetch" }],
    ["a lookup command", { command: "cat README.md", tool: "Bash" }],
    ["a PowerShell lookup command", { command: "rg foo", tool: "PowerShell" }],
    ["a PowerShell read cmdlet", { command: "Get-Content file.txt", tool: "PowerShell" }],
  ])("counts %s as a lookup", (_description, call) => {
    expect.hasAssertions();

    expect(getCallStep(call)).toStrictEqual(DelegationStep.Lookup);
  });

  test.each([
    ["Agent", { tool: "Agent" }],
    ["Edit", { tool: "Edit" }],
    ["Write", { tool: "Write" }],
    ["NotebookEdit", { tool: "NotebookEdit" }],
    ["a shell command that is not a lookup", { command: "pnpm test", tool: "Bash" }],
    ["a lookup command run in the background", { command: "cat README.md", run_in_background: true, tool: "Bash" }],
  ])("resets the count on %s", (_description, call) => {
    expect.hasAssertions();

    expect(getCallStep(call)).toStrictEqual(DelegationStep.Reset);
  });

  test.each([
    ["a tool that is neither", { tool: "TodoWrite" }],
    ["a lookup made in a subagent", { agentId: "agent", tool: "Read" }],
    ["an edit made in a subagent", { agentId: "agent", tool: "Edit" }],
  ])("leaves the count alone for %s", (_description, call) => {
    expect.hasAssertions();

    expect(getCallStep(call)).toStrictEqual(DelegationStep.Neutral);
  });
});
