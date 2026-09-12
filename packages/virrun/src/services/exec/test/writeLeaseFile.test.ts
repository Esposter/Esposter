import { seedFile } from "#src/services/exec/test/seedFile.test";
import { join } from "node:path";
import { describe } from "vitest";
// Seeds an empty lease file named by pid into leasesDirectory (created if absent) and returns its path — the shared atom
// Behind every reaping test's lease fixture, mirroring how createLease writes a live-user lease (leases/<pid>).
export const writeLeaseFile = (leasesDirectory: string, pid: number): string =>
  seedFile(join(leasesDirectory, String(pid)));

describe.todo("writeLeaseFile");
