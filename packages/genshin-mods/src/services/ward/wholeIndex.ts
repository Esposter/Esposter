import type { EngineInterface, ToolCallResult } from "claude-code";

import { atom, read } from "claude-code";

import { InitialState } from "../InitialState";
import { joinDirectory } from "../shell/joinDirectory";
import { getCheckoutPeer } from "./getCheckoutPeer";
import { getCheckoutRoot } from "./getCheckoutRoot";
import { getWholeIndexDenyReason } from "./getWholeIndexDenyReason";
import { getWholeIndexRefusal } from "./getWholeIndexRefusal";
import { readRecords } from "./readRecords";
import { resolveRecordsPath } from "./resolveRecordsPath";

const enabledModsAtom = atom({ key: "enabledMods", plugin: "genshin-mods" } as const, InitialState.enabledMods);

// A whole-index git command is refused while the ward's records show another session editing the checkout it runs in,
// The session's folder moved by a `cd` before it and by its `-C`. With the Ward off nothing is recorded, so there is no
// Peer to see and the command runs
// A declaration, not an arrow: the hooks module's bundle
// oxlint-disable-next-line func-style -- follows an imported helper that takes `$` only into a function declaration
export async function wholeIndex(
  $: EngineInterface,
  command: string,
  proceed: () => Promise<ToolCallResult>,
): Promise<ToolCallResult> {
  const refusal = getWholeIndexRefusal(command);
  if (refusal === undefined || !(await read($, enabledModsAtom)).ward) return proceed();
  const records = await readRecords($, await resolveRecordsPath($));
  const checkoutRoot = await getCheckoutRoot($, joinDirectory(await $.session.cwd(), refusal.directory));
  const peerPath = getCheckoutPeer(records, checkoutRoot, await $.session.id(), await $.clock.now());
  return peerPath === undefined ? proceed() : { deny: getWholeIndexDenyReason(refusal.form, peerPath) };
}
