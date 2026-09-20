import { runGit } from "#src/services/shared/runGit";

// `HEAD` always resolves, so unlike `readSha` this never answers with nothing
export const readHeadSha = (cwd?: string): string => runGit(["rev-parse", "HEAD"], cwd).trim();
