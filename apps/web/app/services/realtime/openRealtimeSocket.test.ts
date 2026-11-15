import type { RealtimeSocketOptions } from "#src/models/realtime/RealtimeSocketOptions";

import { describe, vi } from "vitest";

// The socket is the seam, since the nuxt test environment does not run one. Each call is one open the code under test
// Made, and an open that succeeds at once opens and settles its first attempt, so a join or a knock waiting on it resumes.
// Every frame sent up any socket is recorded on `sendRealtimeFrame`
export const sendRealtimeFrame = vi.fn<(text: string) => void>();

export const openRealtimeSocket = vi.fn<
  (
    getUrl: () => string,
    onFrame: (text: string) => void,
    options?: RealtimeSocketOptions,
  ) => { close: () => void; send: (text: string) => void }
>((_getUrl, _onFrame, options) => {
  options?.onSettled?.();
  options?.onOpen?.();
  return { close: () => undefined, send: sendRealtimeFrame };
});

describe.todo("openRealtimeSocket");
