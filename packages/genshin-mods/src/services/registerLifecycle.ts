import type { On } from "claude-code";

import { atom, read, update } from "claude-code";

import { ModName, ModNames } from "../models/ModName";
import { TaskStatus } from "../models/TaskStatus";
import { checkIsEnabledMods } from "./checkIsEnabledMods";
import { closeCommission } from "./commission/closeCommission";
import { VEIL_SECTION_ID, VEIL_SYSTEM_SECTION } from "./constants";
import { InitialState } from "./InitialState";
import { ModDescriptionMap } from "./ModDescriptionMap";
import { watchPulse } from "./pulse/watchPulse";
import { armCacheWarning } from "./resin/armCacheWarning";
import { runDetached } from "./runDetached";
import { readTypeSafeKey } from "./sins/readTypeSafeKey";
import { scoreSins } from "./sins/scoreSins";
import { turnState } from "./turnState";
import { suggestWaypoints } from "./waypoints/suggestWaypoints";

// The engine traces a state reference only to an atom made in its own file, so a file declares the atoms it reads.
// These copies of another file's atoms are required, and the duplicate-code gate skips them
// `jscpd:ignore-start`
const commissionAtom = atom({ key: "commission", plugin: "genshin-mods" } as const, InitialState.commission);
const enabledModsAtom = atom({ key: "enabledMods", plugin: "genshin-mods" } as const, InitialState.enabledMods);
const lastPromptAtom = atom({ key: "lastPrompt", plugin: "genshin-mods" } as const, InitialState.lastPrompt);
// `jscpd:ignore-end`
const lastCacheRequestAtAtom = atom(
  { key: "lastCacheRequestAt", plugin: "genshin-mods" } as const,
  InitialState.lastCacheRequestAt,
);
const lookupStreakAtom = atom({ key: "lookupStreak", plugin: "genshin-mods" } as const, InitialState.lookupStreak);
const nowAtom = atom({ key: "now", plugin: "genshin-mods" } as const, InitialState.now);
const sinHistoryAtom = atom({ key: "sinHistory", plugin: "genshin-mods" } as const, InitialState.sinHistory);
const sinSessionAtom = atom({ key: "sinSession", plugin: "genshin-mods" } as const, InitialState.sinSession);
const sinStatusAtom = atom({ key: "sinStatus", plugin: "genshin-mods" } as const, InitialState.sinStatus);
const waypointsAtom = atom({ key: "waypoints", plugin: "genshin-mods" } as const, InitialState.waypoints);
// The events a plugin may hook once with no matcher, each hooked here for every mod, with the commands that switch the mods
export const registerLifecycle = (on: On, typeSafeKey: string): void => {
  // The bare command flips a mod and an argument sets it, kept in the store so it holds for every later session
  for (const name of ModNames)
    on("command.run", { command: name }, async ($, e) => {
      const argument = e.args.trim().toLowerCase();
      const current = await read($, enabledModsAtom);
      const isNext = argument ? argument === "on" : !current[name];
      // Sins scores only with a TypeSafe key, so turning it on without one is refused and its value is left as it was
      if (name === ModName.Sins && isNext) {
        const key = await readTypeSafeKey($, typeSafeKey);
        if (!key)
          return { text: "Sins needs a TypeSafe key: set the typesafe_key option, or TYPESAFE_API_KEY, first." };
      }

      const enabledMods = await update($, enabledModsAtom, (value) => ({ ...value, [name]: isNext }));
      await $.store.set(enabledModsAtom.ref.key, enabledMods);
      return { text: `${name} is ${enabledMods[name] ? "on" : "off"}.` };
    });

  on("session.start", async ($, e, next) => {
    const stored: unknown = await $.store.get(enabledModsAtom.ref.key);
    await update($, enabledModsAtom, (value) => ({ ...value, ...(checkIsEnabledMods(stored) ? stored : undefined) }));
    await Promise.all(
      ModNames.map((name) =>
        $.command.register({ argumentHint: "[on|off]", description: ModDescriptionMap[name], name }),
      ),
    );
    runDetached(() => watchPulse($));
    return next(e);
  });
  // A `/clear` or a resume carries on in this process under another conversation, with no `session.start` for it, so
  // Nothing the old one showed is kept
  on("session.end", async ($, e, next) => {
    if (["clear", "resume"].includes(e.reason)) {
      await update($, lastCacheRequestAtAtom, () => InitialState.lastCacheRequestAt);
      await update($, sinHistoryAtom, () => InitialState.sinHistory);
      await update($, sinSessionAtom, () => InitialState.sinSession);
      await update($, sinStatusAtom, () => InitialState.sinStatus);
      await update($, waypointsAtom, () => InitialState.waypoints);
      await closeCommission($);
    }

    return next(e);
  });
  // The prompt is kept as the goal of a commission this turn may open, and a commission whose every task is done has
  // Shown its finished row since the last turn ended, so it closes as the person moves on. A new prompt also starts
  // The lookup count again, since the lookups of the last turn are not the chain of this one
  on("prompt.submit", async ($, e, next) => {
    await update($, waypointsAtom, () => InitialState.waypoints);
    await update($, lookupStreakAtom, () => InitialState.lookupStreak);
    await update($, lastPromptAtom, () => e.text);
    const { tasks } = await read($, commissionAtom);
    if (tasks.length > 0 && tasks.every(({ status }) => status === TaskStatus.Completed)) await closeCommission($);
    $.clock.after(0, () => {
      runDetached(() => scoreSins($, e.text, typeSafeKey));
    });
    return next(e);
  });
  // While the veil is on, the model is told to write placeholders too, so a reply never holds a value to hide
  on("prompt.compose", async ($, e, next) => {
    const result = await next(e);
    const { veil: isVeilEnabled } = await read($, enabledModsAtom);
    const sections = [...result.sections];
    if (isVeilEnabled) sections.push({ id: VEIL_SECTION_ID, scope: "session", text: VEIL_SYSTEM_SECTION });
    return { sections };
  });
  on("turn.start", (_$, e, next) => {
    turnState.isTurnRunning = true;
    return next(e);
  });
  // The cache's lifetime runs from the request that read or wrote it, so each of the main conversation's requests
  // Restarts the countdown as it is sent, not as its reply ends
  on("turn.step", async function* ($, e, next) {
    if (e.agentId === undefined) {
      const now = await $.clock.now();
      await update($, lastCacheRequestAtAtom, () => now);
      await update($, nowAtom, () => now);
    }

    return yield* next(e);
  });
  // An answer of the main conversation asks for waypoints off the turn's own dispatch, so the fork never holds the
  // Turn's end or the next prompt behind it
  on("turn.complete", async ($, e, next) => {
    const result = await next(e);
    if (e.agentId !== undefined) return result;

    turnState.isTurnRunning = false;

    const now = await $.clock.now();
    await update($, nowAtom, () => now);
    await armCacheWarning($);
    if (e.reason === "answer" && (await read($, enabledModsAtom)).waypoints)
      $.clock.after(0, () => {
        runDetached(() => suggestWaypoints($));
      });
    return result;
  });
};
