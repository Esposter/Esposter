import { v7 } from "uuid";

// A UUIDv7 whose time is the row's own createdAt, with a random tail.
// Ordering by id is then ordering by creation, as the app's own ids order.
// Two rows made in the same millisecond still get distinct ids from the random tail
export const getCreatedAtUuidV7 = (createdAt: Date): string => v7({ msecs: createdAt.getTime() });
