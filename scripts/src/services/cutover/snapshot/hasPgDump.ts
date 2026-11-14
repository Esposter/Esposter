import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { getResultAsync } from "@esposter/shared";

const execFileAsync = promisify(execFile);

// Whether the Postgres client tools are on PATH. Without them the snapshot falls back to JSON lines through the driver
export const hasPgDump = (): Promise<boolean> =>
  getResultAsync(() => execFileAsync("pg_dump", ["--version"])).match(
    () => true,
    () => false,
  );
