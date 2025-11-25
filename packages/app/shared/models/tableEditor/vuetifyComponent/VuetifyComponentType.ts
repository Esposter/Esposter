import { VuetifyComponentMap } from "#shared/services/tableEditor/vuetifyComponent/VuetifyComponentMap";
import { z } from "zod";

type VuetifyComponentTypeMap = { [P in keyof VuetifyComponentMap]: P };
export const VuetifyComponentType = Object.fromEntries(
  Object.keys(VuetifyComponentMap).map((key) => [key, key]),
) as VuetifyComponentTypeMap;
export type VuetifyComponentType = keyof typeof VuetifyComponentType;

export const vuetifyComponentTypeSchema = z.enum(VuetifyComponentType) satisfies z.ZodType<VuetifyComponentType>;
