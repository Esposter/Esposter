import type { MessageInMessage } from "@esposter/db-schema";

// A message row as the client holds it. `isLoading` is set only on the optimistic bubble a send renders before the
// Server answers, and is what the bubble's loading state reads — the row itself never carries it
export type ClientMessage = MessageInMessage & { isLoading?: true };
