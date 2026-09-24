import type { Promisable } from "type-fest";

export interface Item {
  [key: string]: unknown;
  active?: boolean;
  badges?: { count: number; icon: string }[];
  color?: string;
  disabled?: boolean;
  icon: string;
  // Opens a divider-separated group in renderings that draw them; a flat menu ignores it
  isGroupStart?: boolean;
  loading?: boolean;
  onClick?: (event: KeyboardEvent | MouseEvent) => Promisable<void>;
  shortTitle?: string;
  title: string;
}
