import { resolve } from "node:path";

// The directory the caller ran the command in. `pnpm -C scripts` moves the working directory to the package, and
// `INIT_CWD` names the one pnpm was run from
export const getInvocationDirectory = (): string => process.env.INIT_CWD ?? process.cwd();

// A path a command line is given, resolved from the directory the caller ran it in. `pnpm -C scripts` moves the working
// Directory to the package, so a path typed at the root would otherwise resolve there
export const resolveInvocationPath = (path: string): string => resolve(getInvocationDirectory(), path);
