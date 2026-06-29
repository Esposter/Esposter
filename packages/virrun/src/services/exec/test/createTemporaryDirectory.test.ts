import { VIRRUN_TEMP_DIR_PREFIX } from "@/services/exec/util/constants";
import { mkdtempSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe } from "vitest";
// A fresh throwaway directory under the OS temp root, realpath-resolved so path comparisons survive a symlinked
// Tmpdir (macOS `/var`→`/private/var`, Windows short names). Shared by the unit tests that need scratch space; a
// `.test.ts` so ctix keeps it out of the public barrel. Callers own cleanup (rmSync in an afterEach).
export const createTemporaryDirectory = (): string => realpathSync(mkdtempSync(join(tmpdir(), VIRRUN_TEMP_DIR_PREFIX)));

describe.todo("createTemporaryDirectory");
