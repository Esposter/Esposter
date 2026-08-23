import { VIRRUN_TEMP_DIR_PREFIX } from "#src/services/exec/util/constants";
import { TEST_FILENAME } from "#src/services/exec/util/constants.test";
import { getResult, withFinalizer } from "@esposter/shared";
import { mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
// Windows only allows symlink creation with Developer Mode or elevation; probe once and let callers skip symlink
// Cases where the OS refuses, exactly as the mirror itself degrades (an uncreatable symlink can't exist in a working
// Tree there).
export const isSymlinkSupported: boolean = getResult(() => {
  const directory = mkdtempSync(join(tmpdir(), VIRRUN_TEMP_DIR_PREFIX));
  withFinalizer(
    () => {
      symlinkSync(TEST_FILENAME, join(directory, TEST_FILENAME));
    },
    () => {
      rmSync(directory, { force: true, recursive: true });
    },
  );
}).match(
  () => true,
  () => false,
);
