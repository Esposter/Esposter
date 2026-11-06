import type { ProductItem } from "@/models/app/ProductItem";

// Products gathered by what they are for, so the launcher reads as a few kinds of work rather than one long list
export interface ProductGroup {
  items: readonly ProductItem[];
  title: string;
}
