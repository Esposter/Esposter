import type { Command } from "agent-console-server/contracts";
import type { DistributedOmit } from "type-fest";

import { MESSAGE_MAX_BYTE_LENGTH } from "agent-console-server/contracts";

// Whether the host would close its socket for a command, measured as the host measures a message: the bytes of the frame
// The page sends it as, which carries the command's id. A command goes out under a UUID, whose length is fixed
export const checkIsCommandTooLarge = (command: DistributedOmit<Command, "id">): boolean =>
  new TextEncoder().encode(JSON.stringify({ ...command, id: crypto.randomUUID() })).byteLength >
  MESSAGE_MAX_BYTE_LENGTH;
