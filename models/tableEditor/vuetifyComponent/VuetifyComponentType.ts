import { VuetifyComponentMap } from "@/services/vuetify/constants";

export const VuetifyComponentType = Object.keys(VuetifyComponentMap).reduce<Record<string, string>>((acc, curr) => {
  acc[curr] = curr;
  return acc;
  // eslint-disable-next-line no-use-before-define
}, {}) as { [P in keyof VuetifyComponentMap]: P };
export type VuetifyComponentType = typeof VuetifyComponentType;
