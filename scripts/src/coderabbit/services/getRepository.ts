import { runGh } from "#src/coderabbit/services/runGh";
import { parseMachineJson } from "#src/services/parseMachineJson";

interface RepositoryView {
  name: string;
  owner: { login: string };
}

// REST accepts `repos/:owner/:repo` and lets `gh` fill both in from the checkout's remote; GraphQL substitutes
// Nothing, so a query naming the repository has to be handed real values. Reading them beats a constant: a
// Hardcoded slug is wrong in a fork and silently reads the upstream's reviews instead of the fork's.
export const getRepository = (): RepositoryView =>
  parseMachineJson<RepositoryView>(runGh(["repo", "view", "--json", "owner,name"]));
