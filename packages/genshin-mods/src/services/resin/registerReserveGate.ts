import type { EngineInterface, On } from "claude-code";

import { atom, read } from "claude-code";

import { RESERVE_REFUSAL_INSTRUCTION } from "../constants";
import { InitialState } from "../InitialState";
import { getReserveSummary } from "./getReserveSummary";

const enabledModsAtom = atom({ key: "enabledMods", plugin: "genshin-mods" } as const, InitialState.enabledMods);
const reserveWindowAtom = atom({ key: "reserveWindow", plugin: "genshin-mods" } as const, InitialState.reserveWindow);

// Any failure lets the launch through, as the ward's does: a gate that blocked on its own failure would block every
// Launch after it. `next` is replay-safe here, so a launch the hook had already decided is not run twice
const letLaunchThrough = <E, R>(_$: EngineInterface, e: E, next: (e: E) => R): R => next(e);

export const registerReserveGate = (on: On): void => {
  // The section only describes the reserve, and a workflow already launched never reads it, so the launch itself is
  // Refused while the reserve holds, past the window's reset too, which the next measurement is yet to read. An agent
  // Launch is the delegation guard's, which refuses one on any model but haiku whether or not a reserve holds
  // eslint-disable-next-line no-restricted-syntax -- The engine's registration handler, run when the hook rejects, not a promise
  on("tool.call", { tool: ["Workflow"] }, async ($, e, next) => {
    if (!(await read($, enabledModsAtom)).resin) return next(e);
    const reserveWindow = await read($, reserveWindowAtom);
    if (!reserveWindow.name || Date.parse(reserveWindow.resetsAt) <= (await $.clock.now())) return next(e);
    return { deny: `${getReserveSummary(reserveWindow)}. ${RESERVE_REFUSAL_INSTRUCTION}` };
  }).catch(letLaunchThrough);
};
