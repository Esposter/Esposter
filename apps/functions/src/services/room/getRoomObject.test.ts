import type { MockD1Database } from "@esposter/db-mock";
import type { MockObjectState, MockSocket } from "#src/services/durableObject/createMockObjectState.test";

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
const mockRooms = new Map<string, { object: RoomObject; state: MockObjectState }>();

export const openMockRooms = async (): Promise<void> => {
  mockCoreDb = (await createMockDb()).coreDatabase;
};

export const clearMockRooms = (): void => {
  mockRooms.clear();
};

const openMockRoom = (roomId: string) => {
  if (!mockCoreDb) throw new InvalidOperationError(Operation.Read, openMockRoom.name, roomId);

  const existingRoom = mockRooms.get(roomId);
  if (existingRoom) return existingRoom;

  const state = createMockObjectState(roomId);
  const environment = {
    CORE: mockCoreDb,
    USER: { get: getUserObject, idFromName: (userId: string) => userId },
  } as unknown as Cloudflare.Env;
  const object = new RoomObject(state.ctx as unknown as DurableObjectState, environment);
  const room = { object, state };
  mockRooms.set(roomId, room);
  return room;
};

// A room's object as the functions Worker reaches it: the same instance for the same room, so a read names what an
// earlier write left. Each person's user object is the shared stand-in, so what a room asks of it is recorded there
export const getRoomObject = (roomId: string): RoomObject => openMockRoom(roomId).object;

// A socket the room accepts as the runtime accepts one, tagged by who opened it, so the room's broadcasts reach it
export const acceptRoomSocket = (roomId: string, socket: MockSocket, tags: string[]): void => {
  openMockRoom(roomId).state.ctx.acceptWebSocket(socket, tags);
};

// The tables a room's storage holds. A room deleted with its object's storage holds none, which a read of its rows cannot show
export const readMockRoomTableNames = (roomId: string): string[] =>
  mockRooms
    .get(roomId)
    ?.state.database.prepare("select name from sqlite_master where type = 'table'")
    .all()
    .map(({ name }) => String(name)) ?? [];

describe.todo("getRoomObject");
