import type { createMeeting } from "#src/services/message/room/realtime/createMeeting.test";

import RealtimeKitClient from "@cloudflare/realtimekit";
import { describe, vi } from "vitest";

export const spyOnMeetingInit = (meeting: ReturnType<typeof createMeeting>["meeting"]) =>
  vi.spyOn(RealtimeKitClient, "init").mockResolvedValue(meeting as unknown as RealtimeKitClient);

describe.todo("spyOnMeetingInit");
