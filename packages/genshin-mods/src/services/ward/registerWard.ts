import type { EngineInterface, On, ToolCallResult } from "claude-code";

import { atom, read } from "claude-code";

import type { WardRecord } from "../../../types";

import { WardAnswer, WardAnswers } from "../../models/WardAnswer";
import { InitialState } from "../InitialState";
import { getCollidingRecord } from "./getCollidingRecord";
import { getRecordsWithEdit } from "./getRecordsWithEdit";

const enabledModsAtom = atom({ key: "enabledMods", plugin: "genshin-mods" } as const, InitialState.enabledMods);
const ageFormat = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

// One file every session on the machine reads afresh, beside the persona's state, so an edit made a moment ago in
// Another session is always seen
const readRecordsPath = async ($: EngineInterface) => {
  const home = (await $.env.get("HOME")) ?? (await $.env.get("USERPROFILE")) ?? "";
  return `${home}/.claude/genshin-mods/ward.json`;
};

const readRecords = async ($: EngineInterface, path: string): Promise<Record<string, WardRecord>> =>
  (await $.fs.exists(path))
    ? // oxlint-disable-next-line no-restricted-properties -- The records hold numbers and ids, no date, and a mod cannot import the shared reviver
      (JSON.parse(await $.fs.read(path)) as Record<string, WardRecord>)
    : {};

// Before the edit: the question, when another session's record calls for one. After it: the edit recorded
const ward = async (
  $: EngineInterface,
  path: string,
  proceed: () => Promise<ToolCallResult>,
): Promise<ToolCallResult> => {
  if (!(await read($, enabledModsAtom)).ward) return proceed();
  const recordsPath = await readRecordsPath($);
  const sessionId = await $.session.id();
  const now = await $.clock.now();
  const collision = getCollidingRecord((await readRecords($, recordsPath))[path], sessionId, now);
  // A session nobody watches has nobody to ask, and a guard that blocks unattended work is worse than none
  if (collision && (await $.session.surfaces()).length > 0) {
    const minutes = -Math.round(Temporal.Duration.from({ milliseconds: now - collision.editedAt }).total("minutes"));
    const age = ageFormat.format(minutes, "minute");
    const answer = await $.ui.ask(`Another session edited ${path} ${age}. Edit it here too?`, {
      header: "Ward",
      options: WardAnswers,
    });
    if (answer === WardAnswer.Worktree)
      return {
        deny: `The person asked to move this work into a git worktree before editing ${path}: another session changed it ${age}. Enter a worktree, then carry on there.`,
      };
    else if (answer === WardAnswer.Cancel)
      return { deny: `The person stopped this edit: another session changed ${path} ${age}.` };
    else if (answer !== WardAnswer.Proceed) return { deny: `The person stopped this edit and said: ${answer}` };
  }

  const result = await proceed();
  if (!result.deny && !result.isError) {
    const records = getRecordsWithEdit(await readRecords($, recordsPath), path, {
      editedAt: await $.clock.now(),
      sessionId,
    });
    await $.fs.write(recordsPath, JSON.stringify(records));
  }

  return result;
};

// Any failure lets the edit through, the question dismissed or the record unreadable alike: a guard that blocked on
// Its own failure would block every edit after it, and Cancel is the person's way to stop one. `next` is replay-safe
// Here, so an edit the hook had already made is not made twice
const letEditThrough = <E, R>(_$: EngineInterface, e: E, next: (e: E) => R): R => next(e);

export const registerWard = (on: On): void => {
  // eslint-disable-next-line no-restricted-syntax -- The engine's registration handler, run when the hook rejects, not a promise
  on("tool.call", { tool: "Edit" }, ($, e, next) => ward($, e.file_path, () => next(e))).catch(letEditThrough);
  // eslint-disable-next-line no-restricted-syntax -- The engine's registration handler, run when the hook rejects, not a promise
  on("tool.call", { tool: "Write" }, ($, e, next) => ward($, e.file_path, () => next(e))).catch(letEditThrough);
  // eslint-disable-next-line no-restricted-syntax -- The engine's registration handler, run when the hook rejects, not a promise
  on("tool.call", { tool: "NotebookEdit" }, ($, e, next) => ward($, e.notebook_path, () => next(e))).catch(
    letEditThrough,
  );
};
