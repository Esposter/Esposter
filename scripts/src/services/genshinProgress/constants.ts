import type { ComputeKind } from "#src/models/fleet/ComputeKind";
import type { GenshinProgressKind } from "#src/models/genshinProgress/GenshinProgressKind";

import { ComputeKinds } from "#src/models/fleet/ComputeKind";
import { ParityPass } from "#src/models/genshinParity/passes/ParityPass";
import { GenshinProgressKinds } from "#src/models/genshinProgress/GenshinProgressKind";

// The Genshin roadmap, whose phase headings group every open item and name each phase
export const GENSHIN_ROADMAP_FILE = "openspec/changes/genshin-roadmap/tasks.md";
// The quest a roadmap item or a script names, in the form `quest <id>`, with the id as its one capture
export const QUEST_ID_PATTERN: string = String.raw`quest (?<id>\d+)`;
// The folder of the scripted sessions, one file per session, which the report reads for the quests each one names. Until
// The first session is written the folder is absent, and the report names no quest
export const GENSHIN_SESSIONS_DIRECTORY = "packages/genshin-world/src/services/dev/sessions";
// The order the report's rows read in: the compute kinds, then the change, the roadmap item and the quest
export const GENSHIN_ROW_KINDS: readonly (ComputeKind | GenshinProgressKind)[] = [
  ...ComputeKinds,
  ...GenshinProgressKinds,
];
// The header over each phase's table of rows
export const GENSHIN_PHASE_HEADER: readonly string[] = [
  "kind",
  "units",
  "done",
  "runnable here",
  "waiting",
  "blocked on the other machine",
  "scripted",
  "not measurable",
  "first blocker",
];
// The most characters of a first blocker a table row prints, its full words being on the unit's own line
export const GENSHIN_BLOCKER_WIDTH = 100;
// The passes a scene may not owe: their measures return `isNotOwed` (`measureMotion.ts`, `measureAudio.ts`), so a row
// Missing for one is not owed or not run, which the report does not record. Every other pass with no row was not held
export const GENSHIN_OPTIONAL_PASSES: readonly ParityPass[] = [ParityPass.Motion, ParityPass.Audio];
// The note a check that no command reads prints beneath its name
export const GENSHIN_NO_COMMAND_NOTE = "no command reads it yet";
// The clauses of each phase's exit gate, one to a check, in the words of the phases table in the `genshin-phases` change's
// Design, "The phases". No command reads one yet, so each prints as not measurable
export const GENSHIN_PHASE_GATES: readonly { gate: string; phase: number }[] = [
  { gate: "A fresh PC and Mac pair reproduces every published dataset and fit from the install", phase: 0 },
  { gate: "every asset family has a spec and a recipe", phase: 0 },
  { gate: "every kind of unit has a check", phase: 0 },
  {
    gate: "Every pass of the login and of Windrise holds and is frozen at every hour and weather, each reference scores under its bar, and the frame cost holds",
    phase: 1,
  },
  {
    gate: "Every screen's parity ids are under their bars in every state it shows, with the game's words by key and every art gap on the roadmap",
    phase: 2,
  },
  {
    gate: "A scripted session plays from the opening: walk, climb, glide, swim, fight, collect, open the menu, save and load, and a quest runs from its table",
    phase: 3,
  },
  {
    gate: "The region's passes hold and are frozen, its spawned places, residents, shops, domains and puzzles are placed, and its first quest chain plays through in a scripted session",
    phase: 4,
  },
  { gate: "Each region meets Mondstadt's gate, region by region", phase: 5 },
  {
    gate: "Each system's scenarios pass, it is reachable through a finished screen, and its data is read from the hosted game data",
    phase: 6,
  },
  {
    gate: "Each reference of the game in a state a person can reach scores under its bar, the frame and load budgets hold, and no art gap is left unrecorded",
    phase: 7,
  },
];
