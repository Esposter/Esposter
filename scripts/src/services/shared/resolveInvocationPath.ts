import { resolve } from "node:path";

// A path a command line is given, resolved from the directory the caller ran it in. `pnpm -C scripts` moves the working
// Directory to the package, so a path typed at the root would otherwise resolve there
export const resolveInvocationPath = (path: string): string => resolve(process.env.INIT_CWD ?? process.cwd(), path);
