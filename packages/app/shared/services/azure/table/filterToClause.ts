import type { Filter } from "#shared/models/message/Filter";
import type { Clause } from "@esposter/shared";

import { FilterType } from "#shared/models/message/FilterType";
import { BinaryOperator, NotFoundError } from "@esposter/shared";

export const filterToClause = ({ key, type, value }: Filter): Clause => {
  switch (type) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    case FilterType.From:
      return { key, operator: BinaryOperator.eq, value };
    default:
      throw new NotFoundError(filterToClause.name, type);
  }
};
