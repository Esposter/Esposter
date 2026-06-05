import type { Promisable } from "type-fest";

export interface Item {
  [key: string]: unknown;
  active?: boolean;
  color?: string;
  icon: string;
  onClick?: (event: KeyboardEvent | MouseEvent) => Promisable<void>;
  shortTitle?: string;
  title: string;
}
