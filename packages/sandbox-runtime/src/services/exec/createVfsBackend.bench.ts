import { createNativeBackend } from "@/services/exec/createNativeBackend";
import { createVfsBackend } from "@/services/exec/createVfsBackend";
import { bench, describe } from "vitest";
// The speed gate for the vfs backend. The hot path — a short-lived `node -e` — is exactly what the
// In-process runner exists to win: vfs evaluates the code in this process (microseconds) while native
// Pays full node process startup (tens of ms) per call. The fall-back path runs a command vfs cannot
// Handle (`node -p`) through both backends to confirm the parse-and-delegate adds ~no overhead — a
// Backend that taxed the commands it punts on would be a net loss. Compare runs against bench/results.
const EVAL_COMMAND = `node -e "process.stdout.write('bench')"`;
const FALLBACK_COMMAND = `node -p "1 + 1"`;
const native = createNativeBackend();
const vfs = createVfsBackend();

describe("createVfsBackend — in-process node -e vs native spawn (hot path)", () => {
  bench("native", async () => {
    await native.exec(EVAL_COMMAND, { cwd: "", stdio: "pipe" });
  });

  bench("vfs", async () => {
    await vfs.exec(EVAL_COMMAND, { cwd: "", stdio: "pipe" });
  });
});

describe("createVfsBackend — fall-back command vs native (no added overhead)", () => {
  bench("native", async () => {
    await native.exec(FALLBACK_COMMAND, { cwd: "", stdio: "pipe" });
  });

  bench("vfs", async () => {
    await vfs.exec(FALLBACK_COMMAND, { cwd: "", stdio: "pipe" });
  });
});
