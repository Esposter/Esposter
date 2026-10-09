import { EMPTY_TREE_SHA, FLEET_IDENTITY_ARGUMENTS } from "#src/services/fleet/constants";
import { runGit } from "#src/services/shared/runGit";

// A parentless commit of the empty tree carrying `message` as JSON, so a claim or a heartbeat is a message and no content
export const createFleetCommit = (message: object): string =>
  runGit([...FLEET_IDENTITY_ARGUMENTS, "commit-tree", EMPTY_TREE_SHA, "-m", JSON.stringify(message)]).trim();
