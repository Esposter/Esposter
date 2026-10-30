import { FIXTURE_IMAGE_NAME, FIXTURE_VARIANT_SEPARATOR } from "#src/services/constants";

// A fixture's image is named after the component's `Index`, and each variant's after the variant, as the visual suites and the
// parity scripts read them
export const getFixtureImageName = (variant: string): string =>
  variant === "" ? FIXTURE_IMAGE_NAME : `${FIXTURE_IMAGE_NAME}${FIXTURE_VARIANT_SEPARATOR}${variant}`;
