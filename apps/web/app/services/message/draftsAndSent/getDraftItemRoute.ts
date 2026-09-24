import type { DraftItem } from "@/models/message/draftsAndSent/DraftItem";

import { RoutePath } from "@esposter/shared";

// A thread's draft opens the thread it replies into, so its composer is the one holding it
export const getDraftItemRoute = ({ room, threadRootRowKey }: DraftItem) =>
  threadRootRowKey ? RoutePath.MessagesThread(room.id, threadRootRowKey) : RoutePath.Messages(room.id);
