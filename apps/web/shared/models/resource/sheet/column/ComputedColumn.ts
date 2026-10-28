import type { ColumnTransformation } from "#shared/models/resource/sheet/column/transformation/ColumnTransformation";
import type { ToData } from "@esposter/shared";

import { AColumn, createAColumnSchema } from "#shared/models/resource/sheet/column/AColumn";
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { columnTransformationSchema } from "#shared/models/resource/sheet/column/transformation/ColumnTransformation";
import { ColumnTransformationType } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationType";
import { z } from "zod";

export class ComputedColumn extends AColumn<ColumnType.Computed> {
  transformation: ColumnTransformation = {
    sourceColumnId: "",
    targetType: ColumnType.String,
    type: ColumnTransformationType.ConvertTo,
  };
  override readonly type = ColumnType.Computed;

  constructor(init?: Partial<ComputedColumn>) {
    super();
    Object.assign(this, init);
  }
}

// oxlint-disable-next-line typescript/no-unsafe-enum-assignment -- ColumnType and ColumnTransformationType (transformation/ColumnTransformationType.ts:1) are the same declarations on both sides; the rule flags a nested zod shape even on an exact enum match
export const computedColumnSchema = z.object({
  ...createAColumnSchema(z.literal(ColumnType.Computed)).shape,
  transformation: columnTransformationSchema,
}) satisfies z.ZodType<ToData<ComputedColumn>>;
