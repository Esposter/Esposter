import type { Filter } from "#shared/models/message/Filter";
import type { Clause } from "@esposter/shared";

import { FilterType } from "#shared/models/message/FilterType";
import { BinaryOperator, NotFoundError, SearchOperator } from "@esposter/shared";

export const filtersToClauses = (filters: Filter[]): Clause[] => {
  const clauses: Clause[] = [];

  for (const [type, filtersByType] of Object.entries(Object.groupBy(filters, ({ type }) => type))) {
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
      default:
        throw new NotFoundError(filtersToClauses.name, type);
    }
  }

  return clauses;
};
