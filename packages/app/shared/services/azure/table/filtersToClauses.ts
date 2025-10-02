/* eslint-disable perfectionist/sort-switch-case */
import type { Filter } from "#shared/models/message/Filter";
import type { Clause } from "@esposter/shared";

import { FilterType } from "#shared/models/message/FilterType";
import { dayjs } from "#shared/services/dayjs";
import { BinaryOperator, NotFoundError, SearchOperator } from "@esposter/shared";

export const filtersToClauses = (filters: Filter[]): Clause[] => {
  const clauses: Clause[] = [];

  for (const [type, filtersByType] of Object.entries(Object.groupBy(filters, ({ type }) => type)))
    switch (type) {
      case FilterType.From:
        for (const { key, value } of filtersByType) clauses.push({ key, operator: BinaryOperator.eq, value });
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
          clauses.push({ key, operator: BinaryOperator.ge, value: date.startOf("day").toString() });
          clauses.push({ key, operator: BinaryOperator.le, value: date.endOf("day").toString() });
        }
        break;
      }
      default:
        throw new NotFoundError(filtersToClauses.name, type);
    }

  return clauses;
};
