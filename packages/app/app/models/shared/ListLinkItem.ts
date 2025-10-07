import type { NuxtLinkProps } from "#app";
import type { AllowedComponentProps, AnchorHTMLAttributes, VNodeProps } from "vue";

export interface ListLinkItem extends Props {
  icon: string;
  onClick?: () => Promise<void>;
  title: string;
}

type Props = AllowedComponentProps & AnchorHTMLAttributes & NuxtLinkProps & VNodeProps;
