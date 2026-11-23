import { FIXTURE_IMAGE_NAME, FIXTURE_VARIANT_SEPARATOR } from "#src/services/constants";

// The naming rule is set out on `FIXTURE_IMAGE_NAME`
export const getFixtureImageName = (variant: string): string =>
  // eslint-disable-next-line no-restricted-syntax -- a fixture variant the code names, never typed
  variant === "" ? FIXTURE_IMAGE_NAME : `${FIXTURE_IMAGE_NAME}${FIXTURE_VARIANT_SEPARATOR}${variant}`;
