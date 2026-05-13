import type { NuxtLinkProps } from "#app";
import type { Promisable } from "type-fest";

export interface ListLinkItem extends NuxtLinkProps {
  icon: string;
  onClick?: () => Promisable<void>;
  title: string;
}
