import { VuetifyComponentMap } from "@/services/tableEditor/vuetifyComponent/constants";

export type VuetifyComponentType = { [Property in keyof VuetifyComponentMap]: Property };
export const VuetifyComponentType = Object.keys(VuetifyComponentMap).reduce<Record<string, string>>((acc, curr) => {
  acc[curr] = curr;
  return acc;
}, {}) as VuetifyComponentType;
