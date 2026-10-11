// The working directory and environment a win32 command is looked up under, the ones the spawn will run with.
export interface ResolveCmdCommandOptions {
  readonly cwd?: string;
  readonly env?: NodeJS.ProcessEnv;
}
