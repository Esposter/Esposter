import type * as baseWebpush from "web-push";

import { describe, vi } from "vitest";

export const webpush: Pick<typeof baseWebpush, "sendNotification"> = {
  sendNotification: vi.fn<typeof baseWebpush.sendNotification>(),
};

describe.todo("webpush");
