import type { RoomMessage } from "@esposter/db-schema";

// A message as the client holds it. A room's object names its messages by their integer id alone.
// The room is added here, the one place its id is carried.
// `isLoading` is set only on the optimistic bubble a send renders before the server answers.
// It is what the bubble's loading state reads — the row itself never carries it
export type ClientMessage = RoomMessage & { isLoading?: true; roomId: string };
