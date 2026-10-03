import type { EngineInterface, On } from "claude-code";

import { atom, read, update } from "claude-code";

import type { TaskCall } from "../../models/TaskCall";

import { TaskTool } from "../../models/TaskTool";
import { InitialState } from "../InitialState";
import { foldTaskCall } from "./foldTaskCall";

const commissionAtom = atom({ key: "commission", plugin: "genshin-mods" } as const, InitialState.commission);
const enabledModsAtom = atom({ key: "enabledMods", plugin: "genshin-mods" } as const, InitialState.enabledMods);
const lastPromptAtom = atom({ key: "lastPrompt", plugin: "genshin-mods" } as const, InitialState.lastPrompt);

// A task tool's call folded in once the tool has answered, opening the commission on its first task with the goal
// Read off the prompt that started the turn
const fold = async ($: EngineInterface, call: TaskCall) => {
  if (!(await read($, enabledModsAtom)).commission) return;
  const now = await $.clock.now();
  const lastPrompt = await read($, lastPromptAtom);
  await update($, commissionAtom, (commission) => ({
    goal: commission.goal || (lastPrompt.split("\n").find(Boolean) ?? "").trim(),
    openedAt: commission.openedAt || now,
    tasks: foldTaskCall(commission.tasks, call),
  }));
};

export const registerCommission = (on: On): void => {
  on("tool.call", { tool: "TaskCreate" }, async ($, e, next) => {
    const result = await next(e);
    if (!result.deny && !result.isError && result.result)
      await fold($, { id: result.result.task.id, subject: e.subject, tool: TaskTool.TaskCreate });
    return result;
  });

  on("tool.call", { tool: "TaskUpdate" }, async ($, e, next) => {
    const result = await next(e);
    if (!result.deny && !result.isError)
      await fold($, { id: e.taskId, status: e.status, subject: e.subject, tool: TaskTool.TaskUpdate });
    return result;
  });

  on("tool.call", { tool: "TodoWrite" }, async ($, e, next) => {
    const result = await next(e);
    if (!result.deny && !result.isError) await fold($, { todos: e.todos, tool: TaskTool.TodoWrite });
    return result;
  });
};
