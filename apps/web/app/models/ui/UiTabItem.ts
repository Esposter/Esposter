import type { UiMenuItem } from "@/models/ui/UiMenuItem";

// One tab of a row of tabs: a choice as a menu's is, and how many things its panel holds, read after its title
export interface UiTabItem<T extends string> extends UiMenuItem<T> {
  count?: number;
}
