import { createNativeBackend } from "@/services/exec/createNativeBackend";
import { createOsBackend } from "@/services/exec/createOsBackend";
import { mkdtempSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { bench, describe } from "vitest";
// The speed harness for the os backend (Linux-only; skips elsewhere). bwrap pays per-exec
// Fork/namespace setup overhead, so trivial micro-commands run through it WILL be slower than native —
// That is expected and not the gate. The os backend is judged on I/O-heavy / install-class workloads
// Where the RAM upper earns its keep, so the workload here writes then reads many small files under the
// Working dir. Step A only establishes the harness; the real speed verdict lands with the Step B
// (pnpm install + native postinstall) workload. Compare runs against the colocated .bench.md.
const native = createNativeBackend();
const dir = realpathSync(mkdtempSync(join(tmpdir(), "os-bench-")));
const IO_COMMAND = "for i in $(seq 1 500); do echo data > f$i; done; cat f* > /dev/null";

describe.skipIf(process.platform !== "linux")("createOsBackend — many small file writes + reads (I/O-class)", () => {
  const os = createOsBackend();

  bench("native", async () => {
    await native.exec(IO_COMMAND, { cwd: dir, stdio: "pipe" });
  });

  bench("os", async () => {
    await os.exec(IO_COMMAND, { cwd: dir, stdio: "pipe" });
  });
});
