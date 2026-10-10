import type { EngineInterface, On, ToolCallResult } from "claude-code";

import { atom, read } from "claude-code";

import { InitialState } from "../InitialState";
import { getCheckoutPeer } from "./getCheckoutPeer";
import { getCheckoutRoot } from "./getCheckoutRoot";
import { getRecordsPath } from "./getRecordsPath";
import { getWholeIndexDenyReason, getWholeIndexRefusal } from "./getWholeIndexRefusal";
import { readRecords } from "./readRecords";

const enabledModsAtom = atom({ key: "enabledMods", plugin: "genshin-mods" } as const, InitialState.enabledMods);

// A whole-index git command is refused while the ward's records show another session editing this checkout. With the
// Ward off nothing is recorded, so there is no peer to see and the command runs
const wholeIndex = async (
  $: EngineInterface,
  command: string,
  proceed: () => Promise<ToolCallResult>,
): Promise<ToolCallResult> => {
  const refusal = getWholeIndexRefusal(command);
  if (refusal === undefined || !(await read($, enabledModsAtom)).ward) return proceed();
  const records = await readRecords($, await getRecordsPath($));
  const checkoutRoot = await getCheckoutRoot($, await $.session.cwd());
  const peerPath = getCheckoutPeer(records, checkoutRoot, await $.session.id(), await $.clock.now());
  return peerPath === undefined ? proceed() : { deny: getWholeIndexDenyReason(refusal, peerPath) };
};

// Any failure lets the command through, as the disk-scan guard's does: a guard that blocked on its own failure would
// Block every command after it
const letCommandThrough = <E, R>(_$: EngineInterface, e: E, next: (e: E) => R): R => next(e);

export const registerWholeIndex = (on: On): void => {
  // eslint-disable-next-line no-restricted-syntax -- The engine's registration handler, run when the hook rejects, not a promise
  on("tool.call", { tool: "Bash" }, ($, e, next) => wholeIndex($, e.command, () => next(e))).catch(letCommandThrough);
};
