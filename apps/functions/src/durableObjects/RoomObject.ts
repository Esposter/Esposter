import roomMigrations from "#src/durableObjects/room/migrations/migrations";
import { RealtimeObject } from "#src/durableObjects/RealtimeObject";
import { createDurableObjectDatabase } from "#src/services/durableObject/createDurableObjectDatabase";

// One Room object per room: its state lives in its own SQLite, and its methods are added with its domain
export class RoomObject extends RealtimeObject {
  protected readonly db = createDurableObjectDatabase(this.ctx, roomMigrations.migrations);
}
