import { createNativeBackend } from "@/services/exec/native/createNativeBackend";
import { createVirrun } from "@/services/virrun/createVirrun";
import { bench, describe } from "vitest";
// Macro gate: a sandbox exec path that loses to the native baseline has negative value. With the
// Native passthrough backend the two should tie; this proves the measurement works, not a win yet.
// Both run the same trivial command with "pipe" stdio so the only thing timed is the sandbox wrapper,
// Not I/O handling. Compare runs against the colocated createVirrun.bench.md to catch regressions.
// Setup is module-level (not beforeAll) because Vitest bench runs the callbacks before the suite
// Hooks resolve; the default dir source allocates no temp state, so there is nothing to dispose.
const COMMAND = `node -e "process.stdout.write('bench')"`;
const nativeBackend = createNativeBackend();
const virrun = await createVirrun();

describe("createVirrun exec vs native baseline", () => {
  bench("native", async () => {
    await nativeBackend.exec(COMMAND, { cwd: "", stdio: "pipe" });
  });

  bench("virrun", async () => {
    await virrun.exec(COMMAND);
  });
});
