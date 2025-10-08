/* eslint-disable perfectionist/sort-switch-case */
import type { Clause, Filter } from "@esposter/shared";

import { FileEntityPropertyNames } from "#shared/models/azure/table/FileEntity";
import { MessageEntityPropertyNames } from "#shared/models/db/message/MessageEntity";
import { dayjs } from "#shared/services/dayjs";
import {
  BinaryOperator,
  FilterType,
  FilterTypeHas,
  getSearchNonNullClause,
  InvalidOperationError,
  NotFoundError,
  Operation,
  SearchOperator,
  serializeValue,
} from "@esposter/shared";
import { types } from "mime-types";

const ContentTypes = Object.values(types);

export const filtersToClauses = (filters: Filter[]): Clause[] => {
  const clauses: Clause[] = [];

  for (const [type, filtersByType] of Object.entries(Object.groupBy(filters, ({ type }) => type)))
    switch (type) {
      case FilterType.From:
        for (const { value } of filtersByType)
          clauses.push({
            key: MessageEntityPropertyNames.userId,
            operator: BinaryOperator.eq,
            value,
          });
        break;
      case FilterType.Mentions: {
        clauses.push({
          key: MessageEntityPropertyNames.mentions,
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
              clauses.push(getSearchNonNullClause(MessageEntityPropertyNames.linkPreviewResponse));
              break;
            case FilterTypeHas.Image:
              clauses.push({
                key: `${MessageEntityPropertyNames.files}/${FileEntityPropertyNames.mimetype}`,
                operator: SearchOperator.arrayContains,
                value: ContentTypes.filter((contentType) => contentType.startsWith("image/")),
              });
              break;
            case FilterTypeHas.Video:
              clauses.push({
                key: `${MessageEntityPropertyNames.files}/${FileEntityPropertyNames.mimetype}`,
                operator: SearchOperator.arrayContains,
                value: ContentTypes.filter((contentType) => contentType.startsWith("video/")),
              });
              break;
            case FilterTypeHas.Sound:
              clauses.push({
                key: `${MessageEntityPropertyNames.files}/${FileEntityPropertyNames.mimetype}`,
                operator: SearchOperator.arrayContains,
                value: ContentTypes.filter((contentType) => contentType.startsWith("audio/")),
              });
              break;
            case FilterTypeHas.Forward:
              clauses.push({
                key: MessageEntityPropertyNames.isForward,
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
          clauses.push({ key: MessageEntityPropertyNames.createdAt, operator: BinaryOperator.lt, value });
        break;
      }
      case FilterType.After: {
        for (const { value } of filtersByType)
          clauses.push({ key: MessageEntityPropertyNames.createdAt, operator: BinaryOperator.gt, value });
        break;
      }
      case FilterType.During: {
        for (const { value } of filtersByType) {
          if (!(value instanceof Date))
            throw new InvalidOperationError(Operation.Read, filtersToClauses.name, serializeValue(value));
          const date = dayjs(value);
          clauses.push({
            key: MessageEntityPropertyNames.createdAt,
            operator: BinaryOperator.ge,
            value: date.startOf("day").toDate(),
          });
          clauses.push({
            key: MessageEntityPropertyNames.createdAt,
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
            key: MessageEntityPropertyNames.isPinned,
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
