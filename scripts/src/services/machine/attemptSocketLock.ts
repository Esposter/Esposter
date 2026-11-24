import type { SocketAttempt } from "#src/models/machine/SocketAttempt";

import { SocketAttemptKind } from "#src/models/machine/SocketAttemptKind";
import { SocketErrorMeaning } from "#src/models/machine/SocketErrorMeaning";
import { getSocketErrorMeaning } from "#src/services/machine/getSocketErrorMeaning";
import { listenSocketLock } from "#src/services/machine/listenSocketLock";
import { probeSocketLock } from "#src/services/machine/probeSocketLock";
import { getResultAsync } from "@esposter/shared";

// One attempt at the socket lock.
// A path nothing holds is listened on and held.
// A path another listener holds is probed, and what the probe finds there is the attempt's answer.
// A path empty by the time it is probed is reported as absent.
export const attemptSocketLock = async (path: string): Promise<SocketAttempt> => {
  const listened = await getResultAsync(() => listenSocketLock(path));
  return listened.match(
    (release): SocketAttempt => ({ kind: SocketAttemptKind.Held, release }),
    async (listenError): Promise<SocketAttempt> => {
      if (getSocketErrorMeaning(listenError) !== SocketErrorMeaning.Contended) throw listenError;
      const probed = await getResultAsync(() => probeSocketLock(path));
      return probed.match(
        (socket): SocketAttempt => ({ kind: SocketAttemptKind.Live, socket }),
        (probeError): SocketAttempt => {
          const meaning = getSocketErrorMeaning(probeError);
          if (meaning === SocketErrorMeaning.Absent) return { kind: SocketAttemptKind.Absent };
          if (meaning === SocketErrorMeaning.Refused) return { kind: SocketAttemptKind.Stale };
          throw probeError;
        },
      );
    },
  );
};
