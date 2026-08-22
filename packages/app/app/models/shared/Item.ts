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
  // A command that is a family rather than one act — the entry opens these instead of running. Both renderings
  // Draw it as a submenu, so a set of formats costs one command rather than one per format
  items?: Item[];
  loading?: boolean;
  onClick?: (event: KeyboardEvent | MouseEvent) => Promisable<void>;
  shortTitle?: string;
  title: string;
}
