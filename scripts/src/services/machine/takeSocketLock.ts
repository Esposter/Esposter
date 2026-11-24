/* oxlint-disable no-await-in-loop -- Each step reads the last: each attempt reads the lock as the last left it, and
   each wait is for a holder's close */
import type { Socket } from "node:net";

import { SocketAttemptKind } from "#src/models/machine/SocketAttemptKind";
import { attemptSocketLock } from "#src/services/machine/attemptSocketLock";
import { removeStaleSocket } from "#src/services/machine/removeStaleSocket";
import { waitForSocketClose } from "#src/services/machine/waitForSocketClose";
import { withFinalizerAsync } from "@esposter/shared";

// Takes the lock at `path`, waiting while a live holder has it, and resolves to the release that gives it back. The
// Wait ends on A holder's close, so no timer is set. A dead holder's socket is removed only while the takeover socket
// Is held, and a live holder found bound under it is waited on rather than removed
export const takeSocketLock = async (
  path: string,
  takeoverPath: string,
  onWaiting: () => void,
): Promise<() => void> => {
  let isWaiting = false;
  const waitFor = async (socket: Socket): Promise<void> => {
    if (!isWaiting) {
      isWaiting = true;
      onWaiting();
    }
    await waitForSocketClose(socket);
  };
  for (;;) {
    const attempt = await attemptSocketLock(path);
    if (attempt.kind === SocketAttemptKind.Held) return attempt.release;
    if (attempt.kind === SocketAttemptKind.Live) await waitFor(attempt.socket);
    if (attempt.kind === SocketAttemptKind.Stale) {
      const takeover = await attemptSocketLock(takeoverPath);
      if (takeover.kind === SocketAttemptKind.Held) {
        // Judged again under the takeover socket, and removed there if still stale. The takeover is given back on every
        // Path
        const judged = await withFinalizerAsync(async () => {
          const again = await attemptSocketLock(path);
          if (again.kind === SocketAttemptKind.Stale) removeStaleSocket(path);
          return again;
        }, takeover.release);
        if (judged.kind === SocketAttemptKind.Held) return judged.release;
        if (judged.kind === SocketAttemptKind.Live) await waitFor(judged.socket);
      } else if (takeover.kind === SocketAttemptKind.Live) await waitFor(takeover.socket);
      else if (takeover.kind === SocketAttemptKind.Stale) removeStaleSocket(takeoverPath);
    }
  }
};
