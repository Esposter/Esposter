import type { ScriptedStep } from "#src/models/dev/ScriptedStep";

// The run of registry lines a script holds from its step at `index` on, up to its first harness step
export const takeScriptedLines = (steps: readonly ScriptedStep[], index: number): string[] => {
  const lines: string[] = [];
  for (const step of steps.slice(index)) {
    if (typeof step !== "string") break;

    lines.push(step);
  }

  return lines;
};
