import type { Filter } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";

import { ContentTypes } from "#server/services/message/search/ContentTypes";
import { getStartOfDay, inJsonArray } from "@esposter/db";
import {
  FilterType,
  filterTypeAuthorTypeSchema,
  FilterTypeHas,
  getMimeCategory,
  MessageTypeAuthorTypeMap,
  MessageTypes,
  MimeCategory,
  messagesInMessage,
} from "@esposter/db-schema";
import { getEndOfDay, InvalidOperationError, NotFoundError, Operation } from "@esposter/shared";
import { eq, gt, gte, inArray, isNotNull, lt, lte, sql } from "drizzle-orm";

// The mimetypes each media filter asks for, read off the one categorisation the uploader uses, so a category the uploader
// recognises is a category search can filter by
const MimeCategoryContentTypesMap = Object.groupBy([...ContentTypes], getMimeCategory);
const FilterTypeHasMimeCategoryMap = {
  [FilterTypeHas.Image]: MimeCategory.Image,
  [FilterTypeHas.Sound]: MimeCategory.Audio,
  [FilterTypeHas.Video]: MimeCategory.Video,
} as const satisfies Partial<Record<FilterTypeHas, MimeCategory>>;

// Every picker writes the shape its own filter type declares, so a value of another shape is a bug in the picker
// Rather than something the user typed
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
// alongside the first rather than replacing it, which is why one list of conditions is the whole answer
export const getSearchFilterConditions = (filters: Filter[]): SQL[] => {
  const conditions: SQL[] = [];
  for (const [type, typeFilters] of Object.entries(Object.groupBy(filters, ({ type: filterType }) => filterType))) {
    // Every mentioned user is one any-of condition, so a second `mentions:` widens the match rather than narrowing it
    if (type === FilterType.Mentions)
      conditions.push(getMentionsCondition((typeFilters ?? []).map(({ value }) => getStringValue(type, value))));
    else for (const { value } of typeFilters ?? []) conditions.push(...getFilterConditions(type, value));
  }

  return conditions;
};

const getMentionsCondition = (userIds: string[]): SQL =>
  sql`exists (select 1 from json_each(${messagesInMessage.mentions}) where ${inJsonArray(sql`json_each.value`, userIds)})`;

const getFilterConditions = (type: string, value: Filter["value"]): SQL[] => {
  switch (type) {
    case FilterType.After:
      return [gt(messagesInMessage.createdAt, getDateValue(type, value))];
    case FilterType.AuthorType: {
      const authorType = filterTypeAuthorTypeSchema.safeParse(value);
      if (!authorType.success) throw getInvalidValueError(type, value);

      return [
        inArray(
          messagesInMessage.type,
          MessageTypes.filter((messageType) => MessageTypeAuthorTypeMap[messageType] === authorType.data),
        ),
      ];
    }
    case FilterType.Before:
      return [lt(messagesInMessage.createdAt, getDateValue(type, value))];
    case FilterType.During: {
      const date = getDateValue(type, value);
      return [
        gte(messagesInMessage.createdAt, getStartOfDay(date)),
        lte(messagesInMessage.createdAt, getEndOfDay(date)),
      ];
    }
    case FilterType.From:
      return [eq(messagesInMessage.userId, getStringValue(type, value))];
    case FilterType.Has:
      return [getHasCondition(getStringValue(type, value))];
    case FilterType.In:
      return [eq(messagesInMessage.roomId, getStringValue(type, value))];
    case FilterType.Pinned:
      if (typeof value !== "boolean") throw getInvalidValueError(type, value);
      return [eq(messagesInMessage.isPinned, value)];
    default:
      throw new NotFoundError(getSearchFilterConditions.name, type);
  }
};

const getHasCondition = (value: string): SQL => {
  switch (value) {
    case FilterTypeHas.Link:
    case FilterTypeHas.Embed:
      // A link preview is only ever made for a message with a link or an embed in it
      return isNotNull(messagesInMessage.linkPreviewResponse);
    case FilterTypeHas.Image:
    case FilterTypeHas.Sound:
    case FilterTypeHas.Video: {
      const mimetypes = MimeCategoryContentTypesMap[FilterTypeHasMimeCategoryMap[value]] ?? [];
      return sql`exists (select 1 from json_each(${messagesInMessage.files}) where ${inArray(sql`json_extract(json_each.value, '$.mimetype')`, mimetypes)})`;
    }
    case FilterTypeHas.File:
      return sql`json_array_length(${messagesInMessage.files}) > 0`;
    case FilterTypeHas.Forward:
      return eq(messagesInMessage.isForward, true);
    default:
      throw new NotFoundError(getSearchFilterConditions.name, value);
  }
};
