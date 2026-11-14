import type { MockD1Database } from "@esposter/db-mock";

import { RoomObject } from "#src/durableObjects/RoomObject";
import { createMockObjectState } from "#src/services/durableObject/createMockObjectState.test";
import { getUserObject } from "#src/services/user/getUserObject.test";
import { createMockDb } from "@esposter/db-mock";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { describe } from "vitest";

// The core database a suite opened, which each room object reads its D1 rows through, as production binds it to CORE
let mockCoreDb: MockD1Database | undefined;
// One room object per room id, each a real RoomObject over the state double its id names. A suite clears them between
// tests, so every test starts from rooms with nothing in them
const mockRoomObjects = new Map<string, RoomObject>();

export const openMockRooms = async (): Promise<void> => {
  mockCoreDb = (await createMockDb()).coreDatabase;
};

export const clearMockRooms = (): void => {
  mockRoomObjects.clear();
};

// A room's object as the functions Worker reaches it: the same instance for the same room, so a read names what an
// earlier write left. Each person's user object is the shared stand-in, so what a room asks of it is recorded there
export const getRoomObject = (roomId: string): RoomObject => {
  if (!mockCoreDb) throw new InvalidOperationError(Operation.Read, getRoomObject.name, roomId);

  const existingRoomObject = mockRoomObjects.get(roomId);
  if (existingRoomObject) return existingRoomObject;

  const environment = {
    CORE: mockCoreDb,
    USER: { get: getUserObject, idFromName: (userId: string) => userId },
  } as unknown as Cloudflare.Env;
  const roomObject = new RoomObject(createMockObjectState(roomId).ctx as unknown as DurableObjectState, environment);
  mockRoomObjects.set(roomId, roomObject);
  return roomObject;
};

describe.todo("getRoomObject");
