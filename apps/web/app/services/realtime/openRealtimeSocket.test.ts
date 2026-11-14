import { describe, vi } from "vitest";

// The socket is the seam, since the nuxt test environment does not run one. Each call is one open the code under test
// Made, and an open that succeeds at once settles its first attempt, so a join or a knock waiting on it resumes
export const openRealtimeSocket = vi.fn<
  (getUrl: () => string, onFrame: (text: string) => void, onSettled?: () => void, onReopen?: () => void) => () => void
>((_getUrl, _onFrame, onSettled) => {
  onSettled?.();
  return () => undefined;
});

describe.todo("openRealtimeSocket");
