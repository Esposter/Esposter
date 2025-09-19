import { selectRoomSchema } from "#shared/db/schema/rooms";
import { selectSearchHistorySchema } from "#shared/db/schema/searchHistories";
import { messageEntitySchema } from "#shared/models/db/message/MessageEntity";
import { ItemMetadataPropertyNames } from "#shared/models/entity/ItemMetadata";
import { filterSchema } from "#shared/models/message/Filter";
import { createOffsetPaginationParamsSchema } from "#shared/models/pagination/offset/OffsetPaginationParams";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { getIsSearchQueryEmpty } from "#shared/services/message/getIsSearchQueryEmpty";
import { MAX_READ_LIMIT } from "#shared/services/pagination/constants";
import { z } from "zod";

export const searchMessagesInputSchema = z
  .object({
    ...createOffsetPaginationParamsSchema(messageEntitySchema.keyof(), 0, [
      { key: ItemMetadataPropertyNames.createdAt, order: SortOrder.Desc },
    ]).shape,
    filters: filterSchema.array().max(MAX_READ_LIMIT).default([]),
    query: selectSearchHistorySchema.shape.query,
    roomId: selectRoomSchema.shape.id,
  })
  .refine(({ filters, query }) => !getIsSearchQueryEmpty(query, filters));
export type SearchMessagesInput = z.infer<typeof searchMessagesInputSchema>;
