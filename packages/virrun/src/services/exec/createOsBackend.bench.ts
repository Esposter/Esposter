import { VIRRUN_TEMP_DIR_PREFIX } from "@/services/exec/constants";
import { OS_BACKEND_BENCH_TASK_NAME } from "@/services/exec/constants.bench";
import { createNativeBackend } from "@/services/exec/createNativeBackend";
import { createOsBackend } from "@/services/exec/createOsBackend";
import { isOsBackendSupported } from "@/services/exec/isOsBackendSupported";
import { mkdtempSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { bench, describe } from "vitest";
// Bwrap pays per-exec fork/namespace overhead, so trivial commands run slower than native — the os
// Backend is judged on I/O-heavy workloads where the RAM upper earns its keep, hence the many-small-file
// Write-then-read workload here. Compare runs against the colocated .bench.md.
const native = createNativeBackend();
const dir = realpathSync(mkdtempSync(join(tmpdir(), VIRRUN_TEMP_DIR_PREFIX)));
const IO_COMMAND = "for i in $(seq 1 500); do echo data > f$i; done; cat f* > /dev/null";

describe.skipIf(!isOsBackendSupported())("createOsBackend — many small file writes + reads (I/O-class)", () => {
  bench("native", async () => {
    await native.exec(IO_COMMAND, { cwd: dir, stdio: "pipe" });
  });

  bench(OS_BACKEND_BENCH_TASK_NAME, async () => {
    const os = createOsBackend();
    await os.exec(IO_COMMAND, { cwd: dir, stdio: "pipe" });
  });
});
