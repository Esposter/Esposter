import { BackendType } from "#src/models/virrun/BackendType";
import { createNativeBackend } from "#src/services/exec/native/createNativeBackend";
import { createTemporaryDirectoryTracker } from "#src/services/exec/test/createTemporaryDirectoryTracker.test";
import { createVfsBackend } from "#src/services/exec/vfs/createVfsBackend";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, test } from "vitest";
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

test("createVfsBackend - in-process node -e vs native spawn (hot path)", async ({ bench }) => {
  await bench.compare(
    bench(BackendType.Native, async () => {
      await native.exec(EVAL_COMMAND, { cwd: "", stdio: "pipe" });
    }),
    bench(BackendType.Vfs, async () => {
      await vfs.exec(EVAL_COMMAND, { cwd: "", stdio: "pipe" });
    }),
    BENCHMARK_RUN_OPTIONS,
  );
});

test("createVfsBackend - in-process node <file> vs native spawn (hot path)", async ({ bench }) => {
  await bench.compare(
    bench(BackendType.Native, async () => {
      await native.exec(FILE_COMMAND, { cwd: dir, stdio: "pipe" });
    }),
    bench(BackendType.Vfs, async () => {
      await vfs.exec(FILE_COMMAND, { cwd: dir, stdio: "pipe" });
    }),
    BENCHMARK_RUN_OPTIONS,
  );
});

test("createVfsBackend - fall-back command vs native (no added overhead)", async ({ bench }) => {
  await bench.compare(
    bench(BackendType.Native, async () => {
      await native.exec(FALLBACK_COMMAND, { cwd: "", stdio: "pipe" });
    }),
    bench(BackendType.Vfs, async () => {
      await vfs.exec(FALLBACK_COMMAND, { cwd: "", stdio: "pipe" });
    }),
    BENCHMARK_RUN_OPTIONS,
  );
});
