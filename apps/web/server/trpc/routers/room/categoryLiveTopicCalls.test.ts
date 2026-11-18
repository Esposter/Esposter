import type { Context } from "#server/trpc/context";
import type { LiveTopicCalls } from "#server/trpc/routers/liveTopicCoverage.test";

import { createCallerFactory } from "#server/trpc/index";
import { trpcRouter } from "#server/trpc/routers/index";
import { v7 } from "uuid";

const name = "name";
const otherName = "otherName";

// The room category router's cases for the app-wide live topic check: the room list is grouped by the viewer's categories,
// So each write creates, reorders or removes one of them
export const createCategoryLiveTopicCalls = async (context: Context): Promise<LiveTopicCalls> => {
  const categoryCaller = createCallerFactory(trpcRouter)(context).room.category;
  const firstCategory = await categoryCaller.createRoomCategory({ id: v7(), name });
  const secondCategory = await categoryCaller.createRoomCategory({ id: v7(), name: otherName });
  return {
    queries: [
      {
        call: (callContext) => createCallerFactory(trpcRouter)(callContext).room.category.readRoomCategories(),
        path: "room.category.readRoomCategories",
      },
    ],
    writes: [
      {
        call: (callContext) =>
          createCallerFactory(trpcRouter)(callContext).room.category.createRoomCategory({ id: v7(), name }),
        path: "room.category.createRoomCategory",
      },
      {
        call: (callContext) =>
          createCallerFactory(trpcRouter)(callContext).room.category.reorderRoomCategories([
            { id: firstCategory.id, position: 1 },
            { id: secondCategory.id, position: 0 },
          ]),
        path: "room.category.reorderRoomCategories",
      },
      {
        call: (callContext) =>
          createCallerFactory(trpcRouter)(callContext).room.category.deleteRoomCategory(firstCategory.id),
        path: "room.category.deleteRoomCategory",
      },
    ],
  };
};
