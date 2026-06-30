import { BackendType } from "@/models/virrun/BackendType";
import { createNativeBackend } from "@/services/exec/native/createNativeBackend";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { createVfsBackend } from "@/services/exec/vfs/createVfsBackend";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, bench, describe } from "vitest";
// The speed gate for the vfs backend. The hot path - a short-lived `node -e` - is exactly what the
// In-process runner exists to win: vfs evaluates the code in this process (microseconds) while native
// Pays full node process startup (tens of ms) per call. The file-run path is the same win for
// `node <file>`. The fall-back path runs a command vfs cannot handle (`node -p`) through both backends
// To confirm the parse-and-delegate adds ~no overhead - a backend that taxed the commands it punts on
// Would be a net loss. Compare runs against the colocated createVfsBackend.bench.md.
const EVAL_COMMAND = `node -e "process.stdout.write('bench')"`;
const FALLBACK_COMMAND = `node -p "1 + 1"`;
const native = createNativeBackend();
const vfs = createVfsBackend();
const temporaryDirectories = createTemporaryDirectoryTracker();
const dir = temporaryDirectories.create();
writeFileSync(join(dir, "bench.cjs"), "process.stdout.write('bench')");
const FILE_COMMAND = "node bench.cjs";

afterAll(() => {
  temporaryDirectories.cleanup();
});

describe("createVfsBackend - in-process node -e vs native spawn (hot path)", () => {
  bench(BackendType.Native, async () => {
    await native.exec(EVAL_COMMAND, { cwd: "", stdio: "pipe" });
  });

  bench(BackendType.Vfs, async () => {
    await vfs.exec(EVAL_COMMAND, { cwd: "", stdio: "pipe" });
  });
});

describe("createVfsBackend - in-process node <file> vs native spawn (hot path)", () => {
  bench(BackendType.Native, async () => {
    await native.exec(FILE_COMMAND, { cwd: dir, stdio: "pipe" });
  });

  bench(BackendType.Vfs, async () => {
    await vfs.exec(FILE_COMMAND, { cwd: dir, stdio: "pipe" });
  });
});

describe("createVfsBackend - fall-back command vs native (no added overhead)", () => {
  bench(BackendType.Native, async () => {
    await native.exec(FALLBACK_COMMAND, { cwd: "", stdio: "pipe" });
  });

  bench(BackendType.Vfs, async () => {
    await vfs.exec(FALLBACK_COMMAND, { cwd: "", stdio: "pipe" });
  });
});
