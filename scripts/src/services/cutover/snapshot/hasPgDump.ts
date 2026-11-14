import { getResultAsync } from "@esposter/shared";
import { execFileAsync } from "@esposter/shared-node/child-process";

// Whether the Postgres client tools are on PATH. Without them the snapshot falls back to JSON lines through the driver
export const hasPgDump = (): Promise<boolean> =>
  getResultAsync(() => execFileAsync("pg_dump", ["--version"])).match(
    () => true,
    () => false,
  );
