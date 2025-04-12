import type { Type } from "arktype";

import { type } from "arktype";

export enum VuetifyComponentItemType {
  VuetifyComponent = "VuetifyComponent",
}

export const vuetifyComponentItemTypeSchema = type.valueOf(
  VuetifyComponentItemType,
) satisfies Type<VuetifyComponentItemType>;
