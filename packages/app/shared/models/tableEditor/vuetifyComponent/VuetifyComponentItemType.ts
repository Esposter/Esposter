import { z } from "zod";

export enum VuetifyComponentItemType {
  VuetifyComponent = "VuetifyComponent",
}

export const vuetifyComponentItemTypeSchema = z.enum(
  VuetifyComponentItemType,
) satisfies z.ZodType<VuetifyComponentItemType>;
