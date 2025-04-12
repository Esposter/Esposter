import type { Visual } from "#shared/models/dashboard/data/Visual";
import type { ToData } from "#shared/models/entity/ToData";
import type { Type } from "arktype";

import { visualSchema } from "#shared/models/dashboard/data/Visual";
import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { type } from "arktype";

export class Dashboard extends AItemEntity {
  visuals: Visual[] = [];
}

export const dashboardSchema = aItemEntitySchema.merge(type({ visuals: visualSchema.array() })) satisfies Type<
  ToData<Dashboard>
>;
