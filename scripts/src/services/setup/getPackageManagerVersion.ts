import { PACKAGE_MANAGER_REGEX } from "#src/services/shared/constants";

// The version a `packageManager` pin names, or the empty string when there is no pin or it is not `<name>@<version>`
export const getPackageManagerVersion = (packageManager: string | undefined): string =>
  packageManager?.match(PACKAGE_MANAGER_REGEX)?.groups?.version ?? "";
