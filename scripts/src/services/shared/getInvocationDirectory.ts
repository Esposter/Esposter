// The directory the caller ran the command in. `pnpm -C scripts` moves the working directory to the package, and
// `INIT_CWD` names the one pnpm was run from
export const getInvocationDirectory = (): string => process.env.INIT_CWD ?? process.cwd();
