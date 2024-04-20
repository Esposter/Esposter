import { VuetifyComponentMap } from "@/services/tableEditor/vuetifyComponent/VuetifyComponentMap";
import { z } from "zod";

type VuetifyComponentTypeMap = { [P in keyof VuetifyComponentMap]: P };
export const VuetifyComponentType = Object.keys(VuetifyComponentMap).reduce<Record<string, string>>((acc, curr) => {
  acc[curr] = curr;
  return acc;
}, {}) as VuetifyComponentTypeMap;
export type VuetifyComponentType = keyof typeof VuetifyComponentType;

export const vuetifyComponentTypeSchema = z.nativeEnum(VuetifyComponentType) satisfies z.ZodType<VuetifyComponentType>;
