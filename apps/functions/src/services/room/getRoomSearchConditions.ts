import type { Filter } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";

import { messagesInRoom } from "#src/durableObjects/room/schema";
import { getStartOfDay, inJsonArray } from "@esposter/db";
import {
  FilterType,
  filterTypeAuthorTypeSchema,
  FilterTypeHas,
  getMimeCategory,
  MessageTypeAuthorTypeMap,
  MessageTypes,
  MimeCategory,
} from "@esposter/db-schema";
import {
  getEndOfDay,
  getExtensionMimeTypeMap,
  InvalidOperationError,
  NotFoundError,
  Operation,
} from "@esposter/shared";
import { eq, gt, gte, inArray, isNotNull, lt, lte, sql } from "drizzle-orm";

// The mimetypes each media filter asks for, read off the one categorisation the uploader uses
const MimeCategoryContentTypesMap = Object.groupBy([...new Set(getExtensionMimeTypeMap().values())], getMimeCategory);
const FilterTypeHasMimeCategoryMap = {
  [FilterTypeHas.Image]: MimeCategory.Image,
  [FilterTypeHas.Sound]: MimeCategory.Audio,
  [FilterTypeHas.Video]: MimeCategory.Video,
} as const satisfies Partial<Record<FilterTypeHas, MimeCategory>>;

const getInvalidValueError = (name: string, value: unknown) =>
  new InvalidOperationError(Operation.Read, name, JSON.stringify(value));

const getStringValue = (name: string, value: Filter["value"]): string => {
  if (typeof value !== "string") throw getInvalidValueError(name, value);
  return value;
};

const getDateValue = (name: string, value: Filter["value"]): Date => {
  if (!(value instanceof Date)) throw getInvalidValueError(name, value);
  return value;
};

// Each filter adds one condition on the message row, and the conditions are and-joined. A second filter of a type narrows
// alongside the first, so one list of conditions is the whole answer. A room searches only itself: a filter that names
// another room is the caller's to fan out, so it is refused here
export const getRoomSearchConditions = (filters: Filter[]): SQL[] => {
  const conditions: SQL[] = [];
  for (const [type, typeFilters] of Object.entries(Object.groupBy(filters, ({ type: filterType }) => filterType))) {
    if (type === FilterType.Mentions)
      conditions.push(getMentionsCondition((typeFilters ?? []).map(({ value }) => getStringValue(type, value))));
    else for (const { value } of typeFilters ?? []) conditions.push(...getFilterConditions(type, value));
  }

  return conditions;
};

const getMentionsCondition = (userIds: string[]): SQL =>
  sql`exists (select 1 from json_each(${messagesInRoom.mentions}) where ${inJsonArray(sql`json_each.value`, userIds)})`;

const getFilterConditions = (type: string, value: Filter["value"]): SQL[] => {
  switch (type) {
    case FilterType.After:
      return [gt(messagesInRoom.createdAt, getDateValue(type, value))];
    case FilterType.AuthorType: {
      const authorType = filterTypeAuthorTypeSchema.safeParse(value);
      if (!authorType.success) throw getInvalidValueError(type, value);

      return [
        inArray(
          messagesInRoom.type,
          MessageTypes.filter((messageType) => MessageTypeAuthorTypeMap[messageType] === authorType.data),
        ),
      ];
    }
    case FilterType.Before:
      return [lt(messagesInRoom.createdAt, getDateValue(type, value))];
    case FilterType.During: {
      const date = getDateValue(type, value);
      return [gte(messagesInRoom.createdAt, getStartOfDay(date)), lte(messagesInRoom.createdAt, getEndOfDay(date))];
    }
    case FilterType.From:
      return [eq(messagesInRoom.userId, getStringValue(type, value))];
    case FilterType.Has:
      return [getHasCondition(getStringValue(type, value))];
    case FilterType.Pinned:
      if (typeof value !== "boolean") throw getInvalidValueError(type, value);
      return [eq(messagesInRoom.isPinned, value)];
    default:
      throw new NotFoundError(getRoomSearchConditions.name, type);
  }
};

const getHasCondition = (value: string): SQL => {
  switch (value) {
    case FilterTypeHas.Link:
    case FilterTypeHas.Embed:
      // A link preview is only ever made for a message with a link or an embed in it
      return isNotNull(messagesInRoom.linkPreviewResponse);
    case FilterTypeHas.Image:
    case FilterTypeHas.Sound:
    case FilterTypeHas.Video: {
      const mimetypes = MimeCategoryContentTypesMap[FilterTypeHasMimeCategoryMap[value]] ?? [];
      return sql`exists (select 1 from json_each(${messagesInRoom.files}) where ${inArray(sql`json_extract(json_each.value, '$.mimetype')`, mimetypes)})`;
    }
    case FilterTypeHas.File:
      return sql`json_array_length(${messagesInRoom.files}) > 0`;
    case FilterTypeHas.Forward:
      return eq(messagesInRoom.isForward, true);
    default:
      throw new NotFoundError(getRoomSearchConditions.name, value);
  }
};
