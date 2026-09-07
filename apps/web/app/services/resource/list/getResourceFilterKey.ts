import type { ResourceFilterValues } from "@/models/resource/list/ResourceFilterValues";

import { ResourceUpdatedFilter } from "@/models/resource/list/ResourceUpdatedFilter";
import { getResourceFilterInput } from "@/services/resource/list/getResourceFilterInput";

// The identity of the filter the user picked, which is what the row total is cached against. Everything but the
// Updated range comes from the same normalized input the queries are built from, so two spellings of one filter
// Share a total. The range comes from the SELECTION rather than what it resolves to: a relative preset anchors
// Its boundary to Date.now() on every call, so a key holding that resolved date would never repeat and the
// Count — a COUNT(*) behind the trigram and tag predicates over every resource the caller owns — would re-run
// On every page turn, page-size change and sort. A custom range is the two dates the user picked, so those are
// Part of the identity
export const getResourceFilterKey = (values: ResourceFilterValues): string =>
  JSON.stringify({
    ...getResourceFilterInput({ ...values, updatedFilter: "" }),
    updatedFilter: values.updatedFilter,
    ...(values.updatedFilter === ResourceUpdatedFilter.Custom
      ? { updatedAfter: values.updatedAfter, updatedBefore: values.updatedBefore }
      : {}),
  });
