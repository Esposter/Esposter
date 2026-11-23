import { getInvocationDirectory } from "#src/services/shared/getInvocationDirectory";
import { resolve } from "node:path";

// A path a command line is given, resolved from the directory the caller ran it in
export const resolveInvocationPath = (path: string): string => resolve(getInvocationDirectory(), path);
