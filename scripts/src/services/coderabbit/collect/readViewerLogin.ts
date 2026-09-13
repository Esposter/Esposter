import { runGh } from "#src/services/coderabbit/shared/runGh";

// The collector posts as whichever account the token belongs to, and that login is what tells its own replies
// Apart from anyone else's when it decides whether a finding is already answered.
export const readViewerLogin = (): string => runGh(["api", "user", "--jq", ".login"]).trim();
