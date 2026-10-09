import type { Peer } from "#src/models/fleet/data/Peer";

import { toRemotePath } from "#src/services/fleet/data/toRemotePath";

// The command a peer runs for one of its fleet data verbs, from its repository, over one remote directory
export const getFleetCommand = (peer: Peer, verb: string, remoteDirectory: string, extraArguments: string): string =>
  `cd ${toRemotePath(peer.repository)} && pnpm -s ai:fleet:data ${verb} --directory ${toRemotePath(remoteDirectory)}${extraArguments}`;
