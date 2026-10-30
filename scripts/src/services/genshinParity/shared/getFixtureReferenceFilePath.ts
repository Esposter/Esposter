import { REFERENCE_IMAGE_SUFFIX } from "#src/services/genshinParity/fixtures/constants";
import { REFERENCE_FILE_EXTENSION } from "#src/services/genshinParity/reference/constants";
import { getFixtureImageName } from "genshin-interface/getFixtureImageName";
import { join } from "node:path";

// Where a fixture variant's primary reference is committed, beside its snapshot in the fixture's folder.
// It is `Index.reference.webp`, or `Index-<variant>.reference.webp`. `directory` is the fixture's folder
export const getFixtureReferenceFilePath = (directory: string, variant: string): string =>
  join(directory, `${getFixtureImageName(variant)}${REFERENCE_IMAGE_SUFFIX}.${REFERENCE_FILE_EXTENSION}`);
