import { TYPESAFE_KEY_ENVIRONMENT_VARIABLE, TYPESAFE_KEY_FALLBACK_ENVIRONMENT_VARIABLE } from "#src/services/constants";

// The plugin's own option first, then the variable the SDK itself reads, so a shell that already carries the
// Repository's key needs no second copy in the plugin's configuration
export const readTypeSafeKey = (): string =>
  process.env[TYPESAFE_KEY_ENVIRONMENT_VARIABLE] || process.env[TYPESAFE_KEY_FALLBACK_ENVIRONMENT_VARIABLE] || "";
