import { z } from "zod";

export enum VuetifyComponentItemType {
  VuetifyComponent = "VuetifyComponent",
}

export const vuetifyComponentItemTypeSchema = z.nativeEnum(
  VuetifyComponentItemType,
) satisfies z.ZodType<VuetifyComponentItemType>;
