import * as components from "vuetify/components";

export type VuetifyComponentMap = {
  [P in keyof typeof components]: (typeof components)[P];
};

export const VuetifyComponentMap = components;
