import type { EngineInterface, ToolCallResult } from "claude-code";

import { atom, read } from "claude-code";

import { WardAnswer, WardAnswers } from "../../models/WardAnswer";
import { InitialState } from "../InitialState";
import { getCollidingRecord } from "./getCollidingRecord";
import { getRecordsWithEdit } from "./getRecordsWithEdit";
import { readRecords } from "./readRecords";
import { resolveRecordsPath } from "./resolveRecordsPath";

const enabledModsAtom = atom({ key: "enabledMods", plugin: "genshin-mods" } as const, InitialState.enabledMods);
const AGE_FORMATTER = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

// Before the edit: the question, when another session's record calls for one. After it: the edit recorded
// A declaration, not an arrow: the hooks module's bundle
// oxlint-disable-next-line func-style -- follows an imported helper that takes `$` only into a function declaration
export async function ward(
  $: EngineInterface,
  path: string,
  proceed: () => Promise<ToolCallResult>,
): Promise<ToolCallResult> {
  if (!(await read($, enabledModsAtom)).ward) return proceed();
  const recordsPath = await resolveRecordsPath($);
  const sessionId = await $.session.id();
  const now = await $.clock.now();
  const collision = getCollidingRecord((await readRecords($, recordsPath))[path], sessionId, now);
  // A session nobody watches has nobody to ask, and a guard that blocks unattended work is worse than none
  if (collision && (await $.session.surfaces()).length > 0) {
    const minutes = -Math.round(Temporal.Duration.from({ milliseconds: now - collision.editedAt }).total("minutes"));
    const age = AGE_FORMATTER.format(minutes, "minute");
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
}
