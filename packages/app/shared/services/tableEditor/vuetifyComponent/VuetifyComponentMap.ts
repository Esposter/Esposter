import type { KebabCasedPropertiesDeep } from "type-fest";
import type { Component } from "vue";

import { toKebabCase } from "@esposter/shared";
import * as components from "vuetify/components";

export type VuetifyComponentMap = {
  [P in keyof KebabCasedPropertiesDeepVuetifyComponents]: KebabCasedPropertiesDeepVuetifyComponents[P];
};
type KebabCasedPropertiesDeepVuetifyComponents = KebabCasedPropertiesDeep<typeof components>;
// TS2590: Expression produces a union type that is too complex to represent.
export const VuetifyComponentMap = Object.fromEntries(
  Object.entries(components as Record<string, Component>).map(([name, component]) => [toKebabCase(name), component]),
) as VuetifyComponentMap;
