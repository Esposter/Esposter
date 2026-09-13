import { runProbe } from "#src/services/coderabbit/probe/runProbe";
import { getPullRequestArgument } from "#src/services/coderabbit/shared/getPullRequestArgument";

const pullRequest = getPullRequestArgument();
const reply = await runProbe(pullRequest);
console.info(reply);
