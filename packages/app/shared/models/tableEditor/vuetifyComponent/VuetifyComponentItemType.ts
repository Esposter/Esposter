import { z } from "zod";

export enum VuetifyComponentItemType {
  VuetifyComponent = "VuetifyComponent",
}

export const vuetifyComponentItemTypeSchema = z.nativeEnum(
  VuetifyComponentItemType,
) as const satisfies z.ZodType<VuetifyComponentItemType>;
