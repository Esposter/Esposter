import type { ListLinkItem } from "#src/models/shared/ListLinkItem";

export interface ProductItem extends ListLinkItem {
  // One plain line on what it is for, which the About page shows under the title
  description: string;
}
