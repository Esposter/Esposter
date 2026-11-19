import type { Dataset } from "#shared/models/dataset/Dataset";
import type { DatasetQuery } from "#shared/models/dataset/DatasetQuery";
import type { DatasetReference } from "#shared/models/dataset/DatasetReference";

import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { DatasetAggregationType } from "#shared/models/dataset/DatasetAggregationType";
import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { v7 } from "uuid";
import { describe } from "vitest";

// A visual bound to a count of the response column, categorised by it, over a sheet of its own. A test names only the
// Part of the binding it reads: the query, the reference another visual shares, or the snapshot the binding publishes
export const createBoundVisual = ({
  query = { series: [{ aggregation: DatasetAggregationType.Count, column: "response" }], xColumn: "response" },
  reference = { id: v7(), type: DatasetProviderType.Sheet },
  snapshot,
  type = VisualType.Card,
}: { query?: DatasetQuery; reference?: DatasetReference; snapshot?: Dataset; type?: VisualType } = {}) =>
  new Visual({ dataset: { query, reference, ...(snapshot && { snapshot }) }, type });

describe.todo("createBoundVisual");
