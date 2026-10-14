import type { EngineInterface, On, ToolCallResult } from "claude-code";

import { atom, read } from "claude-code";

import type { WardRecord } from "../../../types";

import { InitialState } from "../InitialState";
import { joinDirectory } from "../shell/joinDirectory";
import { getCheckoutPeer } from "./getCheckoutPeer";
import { getParentFolder } from "./getParentFolder";
import { getWholeIndexDenyReason, getWholeIndexRefusal } from "./getWholeIndexRefusal";
import { readRecords } from "./readRecords";
import { resolveRecordsPath } from "./resolveRecordsPath";

const enabledModsAtom = atom({ key: "enabledMods", plugin: "genshin-mods" } as const, InitialState.enabledMods);

// The nearest folder at or above `folder` holding a `.git`, a worktree's file included, undefined when none does
const findCheckoutRoot = async ($: EngineInterface, folder: string): Promise<string | undefined> => {
  if (await $.fs.exists(`${folder}/.git`)) return folder;
  const parent = getParentFolder(folder);
  return parent === undefined ? undefined : findCheckoutRoot($, parent);
};

// The checkout a session's git commands run in: the folder with the `.git`, or the session's own folder where none is
const getCheckoutRoot = async ($: EngineInterface, cwd: string): Promise<string> =>
  (await findCheckoutRoot($, cwd)) ?? cwd;

// A whole-index git command is refused while the ward's records show another session editing the checkout it runs in,
// The session's folder moved by a `cd` before it and by its `-C`. With the Ward off nothing is recorded, so there is no
// Peer to see and the command runs
const wholeIndex = async (
  $: EngineInterface,
  command: string,
  proceed: () => Promise<ToolCallResult>,
): Promise<ToolCallResult> => {
  const refusal = getWholeIndexRefusal(command);
  if (refusal === undefined || !(await read($, enabledModsAtom)).ward) return proceed();
  const records = await readRecords($, await resolveRecordsPath($));
  const checkoutRoot = await getCheckoutRoot($, joinDirectory(await $.session.cwd(), refusal.directory));
  const peerPath = getCheckoutPeer(records, checkoutRoot, await $.session.id(), await $.clock.now());
  return peerPath === undefined ? proceed() : { deny: getWholeIndexDenyReason(refusal.form, peerPath) };
};

// Any failure lets the command through, as the disk-scan guard's does: a guard that blocked on its own failure would
// Block every command after it
const letCommandThrough = <E, R>(_$: EngineInterface, e: E, next: (e: E) => R): R => next(e);

export const registerWholeIndex = (on: On): void => {
  // eslint-disable-next-line no-restricted-syntax -- The engine's registration handler, run when the hook rejects, not a promise
  on("tool.call", { tool: "Bash" }, ($, e, next) => wholeIndex($, e.command, () => next(e))).catch(letCommandThrough);
};
