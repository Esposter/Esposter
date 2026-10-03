import type { EngineInterface, On } from "claude-code";

import { atom, read, update } from "claude-code";

import type { EnabledMods } from "../../types";

import { CACHE_WARNING_MS, CLOCK_TICK_MS, WAYPOINTS_QUESTION } from "./constants";
import { InitialState } from "./InitialState";
import { ModDescriptionMap, ModNames } from "./ModDescriptionMap";
import { getCacheRemainingMs } from "./resin/getCacheRemainingMs";
import { parseWaypoints } from "./waypoints/parseWaypoints";

const commissionAtom = atom({ key: "commission", plugin: "genshin-mods" } as const, InitialState.commission);
const enabledModsAtom = atom({ key: "enabledMods", plugin: "genshin-mods" } as const, InitialState.enabledMods);
const isCommissionExpandedAtom = atom(
  { key: "isCommissionExpanded", plugin: "genshin-mods" } as const,
  InitialState.isCommissionExpanded,
);
const lastPromptAtom = atom({ key: "lastPrompt", plugin: "genshin-mods" } as const, InitialState.lastPrompt);
const lastResponseAtAtom = atom(
  { key: "lastResponseAt", plugin: "genshin-mods" } as const,
  InitialState.lastResponseAt,
);
const nowAtom = atom({ key: "now", plugin: "genshin-mods" } as const, InitialState.now);
const waypointsAtom = atom({ key: "waypoints", plugin: "genshin-mods" } as const, InitialState.waypoints);

// The events a plugin may hook once with no matcher, each hooked here for every mod, with the commands that switch
// The mods. Neither variable is drawn: the expiry already warned about, so each warns once, and whether a turn is
// Renewing the cache itself, when no warning is owed
let warnedLastResponseAt = 0;
let isTurnRunning = false;

const tick = async ($: EngineInterface) => {
  const now = await $.clock.now();
  await update($, nowAtom, () => now);
  const lastResponseAt = await read($, lastResponseAtAtom);
  const remainingMs = getCacheRemainingMs(lastResponseAt, now);
  const isWarningDue = lastResponseAt > 0 && remainingMs > 0 && remainingMs <= CACHE_WARNING_MS;
  if (
    !isWarningDue ||
    isTurnRunning ||
    warnedLastResponseAt === lastResponseAt ||
    !(await read($, enabledModsAtom)).resin
  )
    return;

  warnedLastResponseAt = lastResponseAt;
  $.ui.toast("The prompt cache goes cold in five minutes: warm it, compact or hand off from the band.");
};

const suggestWaypoints = async ($: EngineInterface) => {
  const answer = await $.model.fork({ prompt: WAYPOINTS_QUESTION });
  if (answer.isAnswered) await update($, waypointsAtom, () => parseWaypoints(answer.text));
};

const closeCommission = async ($: EngineInterface) => {
  await update($, commissionAtom, () => InitialState.commission);
  await update($, isCommissionExpandedAtom, () => InitialState.isCommissionExpanded);
};

export const registerLifecycle = (on: On): void => {
  // The bare command flips a mod and an argument sets it, kept in the store so it holds for every later session
  for (const name of ModNames)
    on("command.run", { command: name }, async ($, e) => {
      const argument = e.args.trim().toLowerCase();
      const enabledMods = await update($, enabledModsAtom, (value) => ({
        ...value,
        [name]: argument ? argument === "on" : !value[name],
      }));
      await $.store.set(enabledModsAtom.ref.key, enabledMods);
      return { text: `${name} is ${enabledMods[name] ? "on" : "off"}.` };
    });

  on("session.start", async ($, e, next) => {
    const stored = (await $.store.get(enabledModsAtom.ref.key)) as Partial<EnabledMods> | undefined;
    await update($, enabledModsAtom, (value) => ({ ...value, ...stored }));
    await Promise.all(
      ModNames.map((name) =>
        $.command.register({ argumentHint: "[on|off]", description: ModDescriptionMap[name], name }),
      ),
    );
    // oxlint-disable-next-line unicorn/no-array-method-this-argument -- The engine's clock, not Array.prototype.every
    $.clock.every(CLOCK_TICK_MS, () => {
      // oxlint-disable-next-line typescript/no-floating-promises -- The engine's timer slot takes no promise, and every call in the tick resolves
      tick($);
    });
    return next(e);
  });

  // A `/clear` or a resume carries on in this process under another conversation, with no `session.start` for it, so
  // Nothing the old one showed is kept
  on("session.end", async ($, e, next) => {
    if (e.reason === "clear" || e.reason === "resume") {
      await update($, lastResponseAtAtom, () => InitialState.lastResponseAt);
      await update($, waypointsAtom, () => InitialState.waypoints);
      await closeCommission($);
    }

    return next(e);
  });

  // The prompt is kept as the goal of a commission this turn may open, and a commission whose every task is done has
  // Shown its finished row since the last turn ended, so it closes as the person moves on
  on("prompt.submit", async ($, e, next) => {
    await update($, waypointsAtom, () => InitialState.waypoints);
    await update($, lastPromptAtom, () => e.text);
    const { tasks } = await read($, commissionAtom);
    if (tasks.length > 0 && tasks.every(({ status }) => status === "completed")) await closeCommission($);
    return next(e);
  });

  on("turn.start", (_$, e, next) => {
    isTurnRunning = true;
    return next(e);
  });

  // A reply renews the cache; an answer of the main conversation asks for waypoints off the turn's own dispatch, so
  // The fork never holds the turn's end or the next prompt behind it
  on("turn.complete", async ($, e, next) => {
    const result = await next(e);
    if (e.agentId !== undefined) return result;

    isTurnRunning = false;

    const now = await $.clock.now();
    await update($, lastResponseAtAtom, () => now);
    await update($, nowAtom, () => now);
    if (e.reason === "answer" && (await read($, enabledModsAtom)).waypoints)
      $.clock.after(0, () => {
        // oxlint-disable-next-line typescript/no-floating-promises -- The engine's timer slot takes no promise, and a fork resolves every outcome rather than rejecting
        suggestWaypoints($);
      });
    return result;
  });
};
