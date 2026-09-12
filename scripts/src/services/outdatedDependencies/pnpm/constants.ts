export const PNPM_OUTDATED_COMMAND = "pnpm outdated -r";

export const PNPM_OUTDATED_TIMEOUT_MS: number = Temporal.Duration.from({ minutes: 2 }).total("milliseconds");
