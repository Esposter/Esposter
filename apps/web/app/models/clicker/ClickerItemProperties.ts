import type { Component } from "vue";

export interface ClickerItemProperties {
  // A token's custom property, so the colour follows the selected theme and style
  color: string;
  iconComponent: Component;
  name: string;
  pluralName: string;
}
