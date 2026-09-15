export const PNPM_OUTDATED_ARGS: string[] = ["outdated", "-r", "--format", "json"];

// The command as the report names it when the run itself is what failed. The annotation is redundant to oxlint
// But mandatory to --isolatedDeclarations, which cannot infer an interpolated value.
// oxlint-disable-next-line typescript/no-inferrable-types
export const PNPM_OUTDATED_COMMAND: string = `pnpm ${PNPM_OUTDATED_ARGS.join(" ")}`;

export const PNPM_OUTDATED_TIMEOUT_MS: number = Temporal.Duration.from({ minutes: 2 }).total("milliseconds");
