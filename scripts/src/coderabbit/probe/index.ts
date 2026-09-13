import { getPullRequestArgument } from "#src/services/coderabbit/getPullRequestArgument";
import { runProbe } from "#src/services/coderabbit/probe/runProbe";

const pullRequest = getPullRequestArgument();
const reply = await runProbe(pullRequest);
console.info(reply);
