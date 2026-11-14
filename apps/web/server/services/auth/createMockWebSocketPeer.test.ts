import type { SessionWebSocketPeer } from "#server/models/auth/SessionWebSocketPeer";

import { describe, vi } from "vitest";

// A crossws peer as far as a revoke reads it: the close that ends its socket, recorded for the test to read
export const createMockWebSocketPeer = () => ({ close: vi.fn() }) as unknown as SessionWebSocketPeer["peer"];

describe.todo("createMockWebSocketPeer");
