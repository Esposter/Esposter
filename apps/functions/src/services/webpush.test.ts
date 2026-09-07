import type baseWebpush from "web-push";

import { describe, vi } from "vitest";

export const webpush = {
  sendNotification: vi.fn<typeof baseWebpush.sendNotification>(),
} as unknown as typeof baseWebpush;

describe.todo("webpush");
