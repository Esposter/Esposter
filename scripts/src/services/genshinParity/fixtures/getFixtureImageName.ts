import { FIXTURE_VARIANT_SEPARATOR } from "genshin-interface/constants";

import { IMAGE_NAME } from "#src/services/genshinParity/fixtures/constants";

// A fixture variant's image name without its extension: `Index` for the base screen, `Index-<variant>` for a variant
export const getFixtureImageName = (variant: string): string =>
  variant === "" ? IMAGE_NAME : `${IMAGE_NAME}${FIXTURE_VARIANT_SEPARATOR}${variant}`;
