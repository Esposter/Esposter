/* eslint-disable perfectionist/sort-switch-case */
import type { Clause, Filter } from "@esposter/db-schema";

import { getSearchNonNullClause } from "@/services/azure/search/getSearchNonNullClause";
import { dayjs } from "@/services/dayjs";
import {
  BinaryOperator,
  FileEntityPropertyNames,
  FilterType,
  FilterTypeHas,
  SearchOperator,
  serializeValue,
  StandardMessageEntityPropertyNames,
} from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation } from "@esposter/shared";
import { types } from "mime-types";

const ContentTypes = Object.values(types);

export const filtersToClauses = (filters: Filter[]): Clause[] => {
  const clauses: Clause[] = [];

  for (const [type, filtersByType] of Object.entries(Object.groupBy(filters, ({ type }) => type)))
    switch (type) {
      case FilterType.From:
        for (const { value } of filtersByType)
          clauses.push({
            key: StandardMessageEntityPropertyNames.userId,
            operator: BinaryOperator.eq,
            value,
          });
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
              clauses.push({
                key: `${StandardMessageEntityPropertyNames.files}/${FileEntityPropertyNames.mimetype}`,
                operator: SearchOperator.arrayContains,
                value: ContentTypes.filter((contentType) => contentType.startsWith("image/")),
              });
              break;
            case FilterTypeHas.Video:
              clauses.push({
                key: `${StandardMessageEntityPropertyNames.files}/${FileEntityPropertyNames.mimetype}`,
                operator: SearchOperator.arrayContains,
                value: ContentTypes.filter((contentType) => contentType.startsWith("video/")),
              });
              break;
            case FilterTypeHas.Sound:
              clauses.push({
                key: `${StandardMessageEntityPropertyNames.files}/${FileEntityPropertyNames.mimetype}`,
                operator: SearchOperator.arrayContains,
                value: ContentTypes.filter((contentType) => contentType.startsWith("audio/")),
              });
              break;
            case FilterTypeHas.Forward:
              clauses.push({
                key: StandardMessageEntityPropertyNames.isForward,
                operator: BinaryOperator.eq,
                value: String(true),
              });
              break;
            default:
              throw new NotFoundError(filtersToClauses.name, serializeValue(value));
          }
        break;
      }
      case FilterType.Before: {
        for (const { value } of filtersByType)
          clauses.push({ key: StandardMessageEntityPropertyNames.createdAt, operator: BinaryOperator.lt, value });
        break;
      }
      case FilterType.After: {
        for (const { value } of filtersByType)
          clauses.push({ key: StandardMessageEntityPropertyNames.createdAt, operator: BinaryOperator.gt, value });
        break;
      }
      case FilterType.During: {
        for (const { value } of filtersByType) {
          if (!(value instanceof Date))
            throw new InvalidOperationError(Operation.Read, filtersToClauses.name, serializeValue(value));
          const date = dayjs(value);
          clauses.push({
            key: StandardMessageEntityPropertyNames.createdAt,
            operator: BinaryOperator.ge,
            value: date.startOf("day").toDate(),
          });
          clauses.push({
            key: StandardMessageEntityPropertyNames.createdAt,
            operator: BinaryOperator.le,
            value: date.endOf("day").toDate(),
          });
        }
        break;
      }
      case FilterType.Pinned: {
        for (const { value } of filtersByType) {
          if (typeof value !== "boolean")
            throw new InvalidOperationError(Operation.Read, filtersToClauses.name, serializeValue(value));
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
