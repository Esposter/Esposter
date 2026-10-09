import type { Peer } from "#src/models/fleet/data/Peer";
import type { TransferCommand } from "#src/models/fleet/data/TransferCommand";

import { TarOperation } from "#src/models/fleet/data/TarOperation";
import { TransferDirection } from "#src/models/fleet/data/TransferDirection";
import { getSshArguments } from "#src/services/fleet/data/getSshArguments";
import { getTarArguments } from "#src/services/fleet/data/getTarArguments";
import { toRemotePath } from "#src/services/fleet/data/toRemotePath";

// The remote tar command, its paths quoted for the peer's shell
const getRemoteTarCommand = (operation: TarOperation, directory: string): string =>
  ["tar", ...getTarArguments(operation, toRemotePath(directory))].join(" ");

// The two processes of a transfer, the one that archives the listed files first and the one that unpacks them second:
// A pull archives on the peer over ssh and unpacks here, a push archives here and unpacks on the peer over ssh
export const getTransferCommands = (
  direction: TransferDirection,
  peer: Peer,
  localDirectory: string,
  remoteDirectory: string,
): [TransferCommand, TransferCommand] => {
  const localCreate: TransferCommand = { args: getTarArguments(TarOperation.Create, localDirectory), file: "tar" };
  const localExtract: TransferCommand = { args: getTarArguments(TarOperation.Extract, localDirectory), file: "tar" };
  const remoteCreate: TransferCommand = {
    args: getSshArguments(peer, getRemoteTarCommand(TarOperation.Create, remoteDirectory)),
    file: "ssh",
  };
  const remoteExtract: TransferCommand = {
    args: getSshArguments(peer, getRemoteTarCommand(TarOperation.Extract, remoteDirectory)),
    file: "ssh",
  };
  return direction === TransferDirection.Pull ? [remoteCreate, localExtract] : [localCreate, remoteExtract];
};
