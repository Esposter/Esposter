import type { FilterType } from "@esposter/db-schema";

import { uncapitalize } from "@esposter/shared";

// What the user types to open a filter and what its chip shows — the search field parses this same form back
// Into a type, so the keyword has one spelling wherever it is rendered
export const getFilterKeyword = (filterType: FilterType) => `${uncapitalize(filterType)}:`;
