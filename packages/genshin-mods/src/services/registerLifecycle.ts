import type { EngineInterface, On } from "claude-code";

import { atom, read, update } from "claude-code";

import type { EnabledMods } from "../../types";

import {
  CACHE_WARNING_MS,
  CLOCK_TICK_MS,
  IDLE_WAKE_PROMPT,
  MACHINE_WATCHER_SCRIPT,
  QUEUE_SYNC_TOAST_MILLISECONDS,
  RESERVE_SECTION_ID,
  VEIL_SECTION_ID,
  VEIL_SYSTEM_SECTION,
  WAYPOINTS_QUESTION,
} from "./constants";
import { InitialState } from "./InitialState";
import { ModDescriptionMap, ModNames } from "./ModDescriptionMap";
import { getPulseWake } from "./pulse/getPulseWake";
import { takeWatcherLines } from "./pulse/takeWatcherLines";
import { getCacheRemainingMs } from "./resin/getCacheRemainingMs";
import { getReserveSummary } from "./resin/getReserveSummary";
import { getReserveWindow } from "./resin/getReserveWindow";
import { reserveText } from "./resin/reserveText";
import { parseWaypoints } from "./waypoints/parseWaypoints";

const commissionAtom = atom({ key: "commission", plugin: "genshin-mods" } as const, InitialState.commission);
const enabledModsAtom = atom({ key: "enabledMods", plugin: "genshin-mods" } as const, InitialState.enabledMods);
const isCommissionExpandedAtom = atom(
  { key: "isCommissionExpanded", plugin: "genshin-mods" } as const,
  InitialState.isCommissionExpanded,
);
const lastPromptAtom = atom({ key: "lastPrompt", plugin: "genshin-mods" } as const, InitialState.lastPrompt);
const lastQueueSyncToastMsAtom = atom(
  { key: "lastQueueSyncToastMs", plugin: "genshin-mods" } as const,
  InitialState.lastQueueSyncToastMs,
);
const lastCacheRequestAtAtom = atom(
  { key: "lastCacheRequestAt", plugin: "genshin-mods" } as const,
  InitialState.lastCacheRequestAt,
);
const lookupStreakAtom = atom({ key: "lookupStreak", plugin: "genshin-mods" } as const, InitialState.lookupStreak);
const nowAtom = atom({ key: "now", plugin: "genshin-mods" } as const, InitialState.now);
const reserveWindowAtom = atom({ key: "reserveWindow", plugin: "genshin-mods" } as const, InitialState.reserveWindow);
const waypointsAtom = atom({ key: "waypoints", plugin: "genshin-mods" } as const, InitialState.waypoints);

// The events a plugin may hook once with no matcher, each hooked here for every mod, with the commands that switch
// The mods. Neither variable is drawn: the expiry already warned about, so each warns once, and whether a turn is
// Renewing the cache itself, when no warning is owed
let warnedLastCacheRequestAt = 0;
let isTurnRunning = false;

const tick = async ($: EngineInterface) => {
  const now = await $.clock.now();
  await update($, nowAtom, () => now);
  const lastCacheRequestAt = await read($, lastCacheRequestAtAtom);
  const remainingMs = getCacheRemainingMs(lastCacheRequestAt, now);
  const isWarningDue = lastCacheRequestAt > 0 && remainingMs > 0 && remainingMs <= CACHE_WARNING_MS;
  if (
    !isWarningDue ||
    isTurnRunning ||
    warnedLastCacheRequestAt === lastCacheRequestAt ||
    !(await read($, enabledModsAtom)).resin
  )
    return;

  warnedLastCacheRequestAt = lastCacheRequestAt;
  $.ui.toast("The prompt cache goes cold in five minutes: warm it, compact or hand off from the band.");
};

const suggestWaypoints = async ($: EngineInterface) => {
  const answer = await $.model.fork({ prompt: WAYPOINTS_QUESTION });
  if (answer.isAnswered) await update($, waypointsAtom, () => parseWaypoints(answer.text));
};

// Starts the machine watcher as this session's child and reads what it prints as each chunk arrives. Its idle line wakes the
// Session with the next fleet work, unless a turn runs or a usage reserve winds down then. The watcher prints the idle line
// Again on each reminder it keeps while the machine stays idle, so the reminder is what wakes an idle session again
const watchPulse = async ($: EngineInterface) => {
  if (!(await read($, enabledModsAtom)).pulse) return;

  const cwd = await $.session.cwd();
  if (!(await $.fs.exists(`${cwd}/${MACHINE_WATCHER_SCRIPT}`))) return;

  let pending = "";
  for await (const chunk of $.process.spawn({ argv: ["pnpm", "ai:machine:watch"], cwd })) {
    const taken = takeWatcherLines(pending, chunk.text);
    pending = taken.pending;
    const { isWindDown } = await read($, reserveWindowAtom);
    const wakeOptions = { isTurnRunning, isWindDown };
    if (taken.lines.some((line) => getPulseWake(line, wakeOptions))) await $.prompt.submit({ text: IDLE_WAKE_PROMPT });
  }
};

// Pushes the queue at a turn's end, under the pulse's own switch. The push takes its own lock, so a turn ending while one
// Runs only queues one more. A sync shows nothing unless it fails, and a failure's toast carries the sync's last line, at
// Most once each toast interval
const syncQueue = async ($: EngineInterface) => {
  if (!(await read($, enabledModsAtom)).pulse) return;

  const output = await $.process.run(["node", `${$.plugin.root}/scripts/queueSync.mjs`, await $.session.cwd()]);
  const nowMs = await $.clock.now();
  const lastToastMs = await read($, lastQueueSyncToastMsAtom);
  if (output.exitCode === 0 || nowMs - lastToastMs < QUEUE_SYNC_TOAST_MILLISECONDS) return;

  await update($, lastQueueSyncToastMsAtom, () => nowMs);
  $.ui.toast(`The queue push failed: ${output.stdout.trim()}`);
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
    // oxlint-disable-next-line typescript/no-floating-promises -- The session start takes no promise, and the watcher's lines are read as they come
    watchPulse($);
    return next(e);
  });

  // A `/clear` or a resume carries on in this process under another conversation, with no `session.start` for it, so
  // Nothing the old one showed is kept
  on("session.end", async ($, e, next) => {
    if (e.reason === "clear" || e.reason === "resume") {
      await update($, lastCacheRequestAtAtom, () => InitialState.lastCacheRequestAt);
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
    if (tasks.length > 0 && tasks.every(({ status }) => status === "completed")) await closeCommission($);
    return next(e);
  });

  // While the veil is on, the model is told to write placeholders too, so a reply never holds a value to hide. While a
  // Usage reserve holds and the resin mod is on, the model is told what the reserve's tier asks until the window resets,
  // Which it may have done since the last measurement
  on("prompt.compose", async ($, e, next) => {
    const result = await next(e);
    const { resin, veil } = await read($, enabledModsAtom);
    const reserveWindow = await read($, reserveWindowAtom);
    const sections = [...result.sections];
    if (veil) sections.push({ id: VEIL_SECTION_ID, scope: "session", text: VEIL_SYSTEM_SECTION });
    if (resin && reserveWindow.name && Date.parse(reserveWindow.resetsAt) > (await $.clock.now()))
      sections.push({ id: RESERVE_SECTION_ID, scope: "session", text: reserveText(reserveWindow) });
    return { sections };
  });

  on("turn.start", (_$, e, next) => {
    isTurnRunning = true;
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

    isTurnRunning = false;

    const now = await $.clock.now();
    await update($, nowAtom, () => now);
    // The queue is pushed once the turn has ended, off its own dispatch, so the push never holds the turn
    $.clock.after(0, () => {
      // oxlint-disable-next-line typescript/no-floating-promises -- The engine's timer slot takes no promise, and a failed sync is toasted by the run rather than rejected
      syncQueue($);
    });
    if (e.reason === "answer" && (await read($, enabledModsAtom)).waypoints)
      $.clock.after(0, () => {
        // oxlint-disable-next-line typescript/no-floating-promises -- The engine's timer slot takes no promise, and a fork resolves every outcome rather than rejecting
        suggestWaypoints($);
      });
    return result;
  });

  // The reserve is read off each measurement: it starts at the first window past a tier's line and lifts at the
  // Measurement a window's reset raises, which finds none. The toast names the window once, as the reserve starts, and
  // Again as its maintenance tier is raised to the wind-down
  on("session.measure", async ($, e, next) => {
    const now = await $.clock.now();
    const reserveWindow = getReserveWindow(e.rateLimits, now);
    const previousReserveWindow = await read($, reserveWindowAtom);
    await update($, reserveWindowAtom, () => reserveWindow ?? InitialState.reserveWindow);
    if (
      reserveWindow &&
      (!previousReserveWindow.name || (reserveWindow.isWindDown && !previousReserveWindow.isWindDown)) &&
      (await read($, enabledModsAtom)).resin
    )
      $.ui.toast(`${getReserveSummary(reserveWindow)}.`);

    return next(e);
  });
};
