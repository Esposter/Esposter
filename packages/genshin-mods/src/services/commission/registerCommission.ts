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
// A task tool's call is folded in only once the tool has answered: a denial or an error leaves the commission as it was
const checkIsAnswered = ({ deny, isError }: { deny?: boolean; isError?: boolean }): boolean => !deny && !isError;

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
    if (checkIsAnswered(result) && result.result)
      await fold($, { id: result.result.task.id, subject: e.subject, tool: TaskTool.TaskCreate });
    return result;
  });

  on("tool.call", { tool: "TaskUpdate" }, async ($, e, next) => {
    const result = await next(e);
    if (checkIsAnswered(result))
      await fold($, { id: e.taskId, status: e.status, subject: e.subject, tool: TaskTool.TaskUpdate });
    return result;
  });

  on("tool.call", { tool: "TodoWrite" }, async ($, e, next) => {
    const result = await next(e);
    if (checkIsAnswered(result)) await fold($, { todos: e.todos, tool: TaskTool.TodoWrite });
    return result;
  });
};
