import type { Peer } from "#src/models/fleet/data/Peer";

import { PEERS_FILE_PATH } from "#src/services/fleet/data/constants";
import { parsePeers } from "#src/services/fleet/data/parsePeers";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readFile } from "node:fs/promises";

// The named peer from ~/.esposter/peers.json
export const readPeer = async (name: string): Promise<Peer> => {
  const peer = parsePeers(await readFile(PEERS_FILE_PATH, "utf8"))[name];
  if (peer === undefined) throw new InvalidOperationError(Operation.Read, name, "is not a peer in peers.json");
  return peer;
};
