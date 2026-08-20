/* eslint-disable perfectionist/sort-switch-case */
import type { SelectFields } from "@azure/search-documents";
import type { Clause, Filter, MessageEntity, SerializableValue } from "@esposter/db-schema";

import { ContentTypes } from "@/models/ContentType";
import { getSearchNonNullClause } from "@/services/azure/search/getSearchNonNullClause";
import { dayjs } from "@/services/dayjs";
import {
  BinaryOperator,
  CompositeKeyPropertyNames,
  FileEntityPropertyNames,
  FilterType,
  FilterTypeHas,
  getMimeCategory,
  MimeCategory,
  SearchOperator,
  serializeValue,
  StandardMessageEntityPropertyNames,
} from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation } from "@esposter/shared";

// The one categorisation of a mimetype, so a category the uploader recognises is a category search can filter by
const ContentTypesByMimeCategory = Object.groupBy([...ContentTypes], getMimeCategory);
// Each media filter asks for one mime category; the clause it builds is the same either way
const FilterTypeHasMimeCategoryMap = {
  [FilterTypeHas.Image]: MimeCategory.Image,
  [FilterTypeHas.Sound]: MimeCategory.Audio,
  [FilterTypeHas.Video]: MimeCategory.Video,
} as const satisfies Partial<Record<FilterTypeHas, MimeCategory>>;
// Every remaining filter narrows one field with one operator, so only the pair varies
const FilterTypeClauseMap = {
  [FilterType.After]: { key: StandardMessageEntityPropertyNames.createdAt, operator: BinaryOperator.gt },
  [FilterType.Before]: { key: StandardMessageEntityPropertyNames.createdAt, operator: BinaryOperator.lt },
  [FilterType.From]: { key: StandardMessageEntityPropertyNames.userId, operator: BinaryOperator.eq },
  [FilterType.In]: { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq },
} as const satisfies Partial<Record<FilterType, { key: string; operator: BinaryOperator }>>;

// Every picker writes the shape its own filter type declares, so a value of another shape is a bug in the picker
// Rather than something the user typed
const getInvalidValueError = (value: SerializableValue) =>
  new InvalidOperationError(Operation.Read, filtersToClauses.name, serializeValue(value));

export const filtersToClauses = (
  filters: Filter[],
): Clause<Record<SelectFields<MessageEntity> & string, unknown>>[] => {
  const clauses: Clause<Record<SelectFields<MessageEntity> & string, unknown>>[] = [];

  for (const [type, filtersByType] of Object.entries(Object.groupBy(filters, ({ type: filterType }) => filterType)))
    switch (type) {
      case FilterType.After:
      case FilterType.Before:
      case FilterType.From:
      case FilterType.In:
        for (const { value } of filtersByType) clauses.push({ ...FilterTypeClauseMap[type], value });
        break;
      case FilterType.Mentions: {
        clauses.push({
          key: StandardMessageEntityPropertyNames.mentions,
          operator: SearchOperator.arrayContains,
          value: filtersByType.map(({ value }) => value),
        });
        break;
      }
      case FilterType.Has: {
        for (const { value } of filtersByType)
          switch (value) {
            case FilterTypeHas.Link:
            case FilterTypeHas.Embed:
              // Presence of a link preview implies message had a link/embed
              clauses.push(getSearchNonNullClause(StandardMessageEntityPropertyNames.linkPreviewResponse));
              break;
            case FilterTypeHas.Image:
            case FilterTypeHas.Video:
            case FilterTypeHas.Sound:
              clauses.push({
                key: `${StandardMessageEntityPropertyNames.files}/${FileEntityPropertyNames.mimetype}`,
                operator: SearchOperator.arrayContains,
                value: ContentTypesByMimeCategory[FilterTypeHasMimeCategoryMap[value]] ?? [],
              });
              break;
            case FilterTypeHas.File:
              clauses.push({
                key: StandardMessageEntityPropertyNames.files,
                operator: SearchOperator.arrayAny,
              });
              break;
            case FilterTypeHas.Forward:
              clauses.push({
                key: StandardMessageEntityPropertyNames.isForward,
                operator: BinaryOperator.eq,
                value: true,
              });
              break;
            default:
              throw new NotFoundError(filtersToClauses.name, serializeValue(value));
          }
        break;
      }
      case FilterType.During: {
        for (const { value } of filtersByType) {
          if (!(value instanceof Date)) throw getInvalidValueError(value);

          const date = dayjs(value);
          clauses.push(
            {
              key: StandardMessageEntityPropertyNames.createdAt,
              operator: BinaryOperator.ge,
              value: date.startOf("day").toDate(),
            },
            {
              key: StandardMessageEntityPropertyNames.createdAt,
              operator: BinaryOperator.le,
              value: date.endOf("day").toDate(),
            },
          );
        }
        break;
      }
      case FilterType.Pinned: {
        for (const { value } of filtersByType) {
          if (typeof value !== "boolean") throw getInvalidValueError(value);

          clauses.push({
            key: StandardMessageEntityPropertyNames.isPinned,
            operator: BinaryOperator.eq,
            value: value || null,
          });
        }
        break;
      }
      default:
        throw new NotFoundError(filtersToClauses.name, type);
    }

  return clauses;
};
