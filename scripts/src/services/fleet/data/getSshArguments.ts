import type { Peer } from "#src/models/fleet/data/Peer";

import { expandHomePath } from "#src/services/fleet/data/expandHomePath";

// The arguments that run one command as the peer's user with only the fleet's own key, when the peer names one: a
// Missing key fails at once rather than prompting, and the agent's other keys are never offered
export const getSshArguments = (peer: Peer, remoteCommand: string): string[] => [
  ...(peer.identityFile === "" ? [] : ["-i", expandHomePath(peer.identityFile), "-o", "IdentitiesOnly=yes"]),
  "-o",
  "BatchMode=yes",
  `${peer.user}@${peer.host}`,
  remoteCommand,
];
