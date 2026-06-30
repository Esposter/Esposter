import { BackendType } from "@/models/virrun/BackendType";
import { createNativeBackend } from "@/services/exec/native/createNativeBackend";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { createVfsBackend } from "@/services/exec/vfs/createVfsBackend";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, bench, describe } from "vitest";
// The speed gate for the vfs backend: the in-process runner evaluates a short-lived `node -e`/`node <file>` in
// This process (microseconds) where native pays full process startup. The fall-back case (`node -p`) runs through
// Both backends to confirm parse-and-delegate adds ~no overhead on commands vfs punts to native.
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
