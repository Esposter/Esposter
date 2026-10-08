import type { ConfigWidgetRow } from "#src/models/genshinAssets/gadgets/ConfigWidgetRow";

// The widget config file, its widgets keyed by the item id each one is
export interface ConfigWidgetFile {
  widgets: Record<string, ConfigWidgetRow>;
}
