import type { RowValueType } from "#src/models/user/ProfileCard/RowValueType";
import type { ItemEntityType } from "@esposter/shared";

export interface Row<TType extends RowValueType> extends ItemEntityType<TType> {
  value?: null | string;
}
