import type { NuxtLinkProps } from "#app";

export interface ListLinkItem extends NuxtLinkProps {
  icon: string;
  onClick?: () => Promise<void>;
  title: string;
}
