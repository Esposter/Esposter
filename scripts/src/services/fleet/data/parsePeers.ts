import type { Peer } from "#src/models/fleet/data/Peer";

import { InvalidOperationError, Operation } from "@esposter/shared";

const PEER_FIELDS: readonly string[] = ["host", "identityFile", "parityDirectory", "repository", "user"];

// A peer's field as a string; a field the peers file leaves out is "", which the copy reads as absent
const readField = (name: string, values: Map<string, unknown>, field: string): string => {
  const value = values.get(field) ?? "";
  if (typeof value !== "string") throw new InvalidOperationError(Operation.Read, name, `its ${field} is not a string`);
  return value;
};

// The peers file: a map from each peer's name to its host, user, key, repository and parity directory
export const parsePeers = (text: string): Record<string, Peer> => {
  const value: unknown = JSON.parse(text);
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new InvalidOperationError(Operation.Read, "peers", "the peers file is not a map of peers");
  const peers: Record<string, Peer> = {};
  for (const [name, entry] of Object.entries(value)) {
    if (typeof entry !== "object" || entry === null)
      throw new InvalidOperationError(Operation.Read, name, "the peer is not an object");
    const values = new Map<string, unknown>(Object.entries(entry));
    const [host, identityFile, parityDirectory, repository, user] = PEER_FIELDS.map((field) =>
      readField(name, values, field),
    );
    peers[name] = {
      host: host ?? "",
      identityFile: identityFile ?? "",
      parityDirectory: parityDirectory ?? "",
      repository: repository ?? "",
      user: user ?? "",
    };
  }
  return peers;
};
