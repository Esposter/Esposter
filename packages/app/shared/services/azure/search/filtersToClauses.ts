/* eslint-disable perfectionist/sort-switch-case */
import type { Filter } from "#shared/models/message/Filter";
import type { Clause } from "@esposter/shared";

import { FilterType } from "#shared/models/message/FilterType";
import { FilterTypeHas } from "#shared/models/message/FilterTypeHas";
import { escapeValue } from "#shared/services/azure/search/escapeValue";
import { dayjs } from "#shared/services/dayjs";
import { BinaryOperator, getNonNullClause, NotFoundError, SearchOperator } from "@esposter/shared";
import { types } from "mime-types";

const ContentTypes = Object.values(types);

export const filtersToClauses = (filters: Filter[]): Clause[] => {
  const clauses: Clause[] = [];

  for (const [type, filtersByType] of Object.entries(Object.groupBy(filters, ({ type }) => type)))
    switch (type) {
      case FilterType.From:
        for (const { key, value } of filtersByType)
          clauses.push({ key, operator: BinaryOperator.eq, value: escapeValue(value) });
        break;
      case FilterType.Mentions: {
        const mentionFiltersByKey = Object.groupBy(filtersByType, ({ key }) => key);
        for (const [key, mentionFilters] of Object.entries(mentionFiltersByKey))
          clauses.push({
            key,
            operator: SearchOperator.arrayContains,
            value: mentionFilters.map(({ value }) => value),
          });
        break;
      }
      case FilterType.Has: {
        for (const { key, value } of filtersByType)
          switch (value) {
            case FilterTypeHas.Link:
            case FilterTypeHas.Embed:
              // Presence of a link preview implies message had a link/embed
              clauses.push(getNonNullClause(key));
              break;
            case FilterTypeHas.Image:
              clauses.push({
                key,
                operator: SearchOperator.arrayContains,
                value: ContentTypes.filter((contentType) => contentType.startsWith("image/")),
              });
              break;
            case FilterTypeHas.Video:
              clauses.push({
                key,
                operator: SearchOperator.arrayContains,
                value: ContentTypes.filter((contentType) => contentType.startsWith("video/")),
              });
              break;
            case FilterTypeHas.Sound:
              clauses.push({
                key,
                operator: SearchOperator.arrayContains,
                value: ContentTypes.filter((contentType) => contentType.startsWith("audio/")),
              });
              break;
            case FilterTypeHas.Forward:
              clauses.push({ key, operator: BinaryOperator.eq, value: String(true) });
              break;
            default:
              throw new NotFoundError(filtersToClauses.name, value);
          }
        break;
      }
      case FilterType.Before: {
        for (const { key, value } of filtersByType) clauses.push({ key, operator: BinaryOperator.lt, value });
        break;
      }
      case FilterType.After: {
        for (const { key, value } of filtersByType) clauses.push({ key, operator: BinaryOperator.gt, value });
        break;
      }
      case FilterType.During: {
        for (const { key, value } of filtersByType) {
          const date = dayjs(value);
          clauses.push({ key, operator: BinaryOperator.ge, value: date.startOf("day").toISOString() });
          clauses.push({ key, operator: BinaryOperator.le, value: date.endOf("day").toISOString() });
        }
        break;
      }
      case FilterType.Pinned: {
        for (const { key, value } of filtersByType) clauses.push({ key, operator: BinaryOperator.eq, value });
        break;
      }
      default:
        throw new NotFoundError(filtersToClauses.name, type);
    }

  return clauses;
};
