import type { Component } from "vue";
import type { Color } from "vuetify/lib/util/colorUtils.mjs";

export interface ClickerItemProperties {
  color: Color | undefined;
  iconComponent: Component;
  name: string;
  pluralName: string;
}
