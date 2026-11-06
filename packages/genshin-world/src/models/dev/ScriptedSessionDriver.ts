import type { DevResult } from "#src/models/dev/DevResult";
import type { ScriptedSessionOutcome } from "#src/models/dev/ScriptedSessionOutcome";

// The world a scripted session's runner drives, implemented by the browser driver over one world screen and its
// Registry. `run` is the registry's line runner. `frame` steps the scripted clock one fixed step and then waits one
// Real frame, so worker answers land between steps. `save` takes the screen's last save through the save schema and
// Keeps it. `load` mounts a fresh screen from the kept save and resolves once that screen's ready signal fires
export interface ScriptedSessionDriver {
  frame: () => Promise<void>;
  load: () => Promise<ScriptedSessionOutcome>;
  run: (line: string) => DevResult;
  save: () => ScriptedSessionOutcome;
}
