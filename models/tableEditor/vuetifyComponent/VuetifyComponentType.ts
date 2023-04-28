import { VuetifyComponentMap } from "@/services/tableEditor/vuetifyComponent/constants";

export const VuetifyComponentType = Object.keys(VuetifyComponentMap).reduce<Record<string, string>>((acc, curr) => {
  acc[curr] = curr;
  return acc;
  // eslint-disable-next-line no-use-before-define
}, {}) as { [Property in keyof VuetifyComponentMap]: Property };
export type VuetifyComponentType = typeof VuetifyComponentType;
