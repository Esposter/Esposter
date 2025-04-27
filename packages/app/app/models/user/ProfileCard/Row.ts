import type { ItemEntityType } from "#shared/models/entity/ItemEntityType";
import type { RowValueType } from "@/models/user/ProfileCard/RowValueType";

export interface Row<TType extends RowValueType> extends ItemEntityType<TType> {
  value: null | string | undefined;
}
