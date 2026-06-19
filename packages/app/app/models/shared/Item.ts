import type { Promisable } from "type-fest";

export interface Item {
  [key: string]: unknown;
  active?: boolean;
  badges?: { count: number; icon: string }[];
  color?: string;
  icon: string;
  onClick?: (event: KeyboardEvent | MouseEvent) => Promisable<void>;
  shortTitle?: string;
  title: string;
}
