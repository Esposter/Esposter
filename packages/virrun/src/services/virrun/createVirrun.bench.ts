import { BackendType } from "@/models/virrun/BackendType";
import { createNativeBackend } from "@/services/exec/native/createNativeBackend";
import { createVirrun } from "@/services/virrun/createVirrun";
import { bench, describe } from "vitest";
// Macro gate: a sandbox exec path that loses to native has negative value; with the native passthrough
// Backend the two should tie, proving the measurement works. Same trivial command + "pipe" stdio so only
// The wrapper is timed. Setup is module-level, not beforeAll, because Vitest bench runs callbacks before
// Suite hooks resolve; the default dir source allocates no temp state.
const COMMAND = `node -e "process.stdout.write('bench')"`;
const nativeBackend = createNativeBackend();
const virrun = await createVirrun();

describe("createVirrun exec vs native baseline", () => {
  bench(BackendType.Native, async () => {
    await nativeBackend.exec(COMMAND, { cwd: "", stdio: "pipe" });
  });

  bench("virrun", async () => {
    await virrun.exec(COMMAND);
  });
});
