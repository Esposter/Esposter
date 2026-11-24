import type { EngineInterface } from "claude-code";

import { atom, read } from "claude-code";

import { MACHINE_WATCHER_RETRY_MILLISECONDS, MACHINE_WATCHER_SCRIPT } from "../constants";
import { InitialState } from "../InitialState";
import { runDetached } from "../runDetached";

const enabledModsAtom = atom({ key: "enabledMods", plugin: "genshin-mods" } as const, InitialState.enabledMods);
// Keeps the machine watcher running as this session's child.
// The watcher writes the machine's state, holds its lock and pushes its heartbeat.
// Its output is read only to keep the child's pipe drained.
// A watcher exits at once while another session's watcher holds the machine's lock.
// So each exit starts the watcher again after a wait, and the session that outlives the one watching takes over.
// A declaration, not an arrow: the hooks module's bundle
// oxlint-disable-next-line func-style -- follows an imported helper that takes `$` only into a function declaration
export async function watchPulse($: EngineInterface): Promise<void> {
  if (!(await read($, enabledModsAtom)).pulse) return;

  const cwd = await $.session.cwd();
  if (!(await $.fs.exists(`${cwd}/${MACHINE_WATCHER_SCRIPT}`))) return;
  // The spawn rejects its first pull when the command cannot start, so the loop settles here.
  // Either way, the retry arms.
  await Promise.allSettled([
    Promise.try(async () => {
      for await (const _ of $.process.spawn({ argv: ["pnpm", "ai:machine:watch"], cwd })) {
        // The watcher's output is discarded, since nothing in the session reads it
      }
    }),
  ]);

  $.clock.after(MACHINE_WATCHER_RETRY_MILLISECONDS, () => {
    runDetached(() => watchPulse($));
  });
}
