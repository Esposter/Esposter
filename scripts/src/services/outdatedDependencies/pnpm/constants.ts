export const PNPM_OUTDATED_ARGS: string[] = ["outdated", "-r", "--format", "json"];

// The command as the report names it when the run itself is what failed
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this template literal would otherwise infer
export const PNPM_OUTDATED_COMMAND: string = `pnpm ${PNPM_OUTDATED_ARGS.join(" ")}`;

export const PNPM_OUTDATED_TIMEOUT_MS: number = Temporal.Duration.from({ minutes: 2 }).total("milliseconds");
