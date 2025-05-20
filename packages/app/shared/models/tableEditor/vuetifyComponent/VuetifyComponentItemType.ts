import { z } from "zod/v4";

export enum VuetifyComponentItemType {
  VuetifyComponent = "VuetifyComponent",
}

export const vuetifyComponentItemTypeSchema = z.enum(
  VuetifyComponentItemType,
) satisfies z.ZodType<VuetifyComponentItemType>;
