import type { RepositoryView } from "#src/models/coderabbit/shared/RepositoryView";

import { runGh } from "#src/services/coderabbit/shared/runGh";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";

// REST accepts `repos/{owner}/{repo}` and lets `gh` fill both in from the checkout's remote; GraphQL substitutes
// Nothing, so a query naming the repository has to be handed real values. Reading them beats a constant: a
// Hardcoded slug is wrong in a fork and silently reads the upstream's reviews instead of the fork's.
export const getRepository = (): RepositoryView =>
  parseMachineJson<RepositoryView>(runGh(["repo", "view", "--json", "owner,name"]));
