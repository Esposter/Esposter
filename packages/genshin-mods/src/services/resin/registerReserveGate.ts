import type { EngineInterface, On } from "claude-code";

import { atom, read } from "claude-code";

import { InitialState } from "../InitialState";
import { getReserveRefusal } from "./getReserveRefusal";

const enabledModsAtom = atom({ key: "enabledMods", plugin: "genshin-mods" } as const, InitialState.enabledMods);
const reserveWindowAtom = atom({ key: "reserveWindow", plugin: "genshin-mods" } as const, InitialState.reserveWindow);

// Any failure lets the launch through, as the ward's does: a gate that blocked on its own failure would block every
// Launch after it. `next` is replay-safe here, so a launch the hook had already decided is not run twice
const letLaunchThrough = <E, R>(_$: EngineInterface, e: E, next: (e: E) => R): R => next(e);

export const registerReserveGate = (on: On): void => {
  // The section only describes the reserve, and an agent or a workflow already launched never reads it, so the launch
  // Itself is refused while the reserve holds, past the window's reset too, which the next measurement is yet to read
  // eslint-disable-next-line no-restricted-syntax -- The engine's registration handler, run when the hook rejects, not a promise
  on("tool.call", { tool: ["Agent", "Workflow"] }, async ($, e, next) => {
    if (!(await read($, enabledModsAtom)).resin) return next(e);
    const reserveWindow = await read($, reserveWindowAtom);
    if (Date.parse(reserveWindow.resetsAt) <= (await $.clock.now())) return next(e);
    const refusal = getReserveRefusal(e.tool, e.tool === "Agent" ? e : {}, reserveWindow);
    return refusal === undefined ? next(e) : { deny: refusal };
  }).catch(letLaunchThrough);
};
