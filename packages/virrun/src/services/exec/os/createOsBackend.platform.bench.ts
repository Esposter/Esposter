import { BackendType } from "@/models/virrun/BackendType";
import { createNativeBackend } from "@/services/exec/native/createNativeBackend";
import { createOsBackend } from "@/services/exec/os/createOsBackend";
import { isOsBackendSupported } from "@/services/exec/os/isOsBackendSupported";
import { createTemporaryDirectory } from "@/services/exec/test/createTemporaryDirectory.test";
import { OS_BACKEND_BENCH_TASK_NAME } from "@/services/exec/util/constants.bench";
import { bench, describe } from "vitest";
// Bwrap pays per-exec fork/namespace overhead, so trivial commands run slower than native - the os
// Backend is judged on I/O-heavy workloads where the RAM upper earns its keep, hence the many-small-file
// Write-then-read workload here. The os backend runs natively on Linux (os/linux) and bridged from win32
// (os/wsl) with different numbers, so this is a `.platform.bench.ts`: compare runs against the colocated
// Per-platform .bench.md (createOsBackend.platform.bench.<platform>.md).
const native = createNativeBackend();
const dir = createTemporaryDirectory();
const IO_COMMAND = "for i in $(seq 1 500); do echo data > f$i; done; cat f* > /dev/null";

describe.skipIf(!isOsBackendSupported())("createOsBackend - many small file writes + reads (I/O-class)", () => {
  bench(BackendType.Native, async () => {
    await native.exec(IO_COMMAND, { cwd: dir, stdio: "pipe" });
  });

  bench(OS_BACKEND_BENCH_TASK_NAME, async () => {
    const os = createOsBackend();
    await os.exec(IO_COMMAND, { cwd: dir, stdio: "pipe" });
  });
});
