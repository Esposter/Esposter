import { MockWebPubSubDatabase } from "azure-mock";
import { assert, describe } from "vitest";

// The devices a room's group holds, in the order they joined it
export const readRoomGroupMembers = (roomId: string) => {
  const members = MockWebPubSubDatabase.get(roomId);
  assert.exists(members);
  return [...members];
};

describe.todo("readRoomGroupMembers");
