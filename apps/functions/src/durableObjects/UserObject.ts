import { RealtimeObject } from "#src/durableObjects/RealtimeObject";
import { createDurableObjectDatabase } from "#src/services/durableObject/createDurableObjectDatabase";

// The User object's migrations, which drizzle-kit writes into its folder as its first table is added
const migrations: Record<string, string> = {};

// One User object per user: its state lives in its own SQLite, and its methods are added with its domain
export class UserObject extends RealtimeObject {
  protected readonly db = createDurableObjectDatabase(this.ctx, migrations);
}
