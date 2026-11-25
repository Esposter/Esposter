// The DOM attributes and properties Vue's element types leave out, and the `data-*` attributes a component passes to
// Its root, which a generic component's prop check reads in their camelCase spelling
declare module "vue" {
  interface AllowedComponentProps {
    [key: `data-${string}`]: unknown;
    [key: `data${Capitalize<string>}`]: unknown;
  }

  // @TODO: https://github.com/vuejs/core/pull/10977
  interface ButtonHTMLAttributes {
    popovertarget?: string;
  }

  // @TODO: https://github.com/vuejs/core/pull/10977
  interface HTMLAttributes {
    popover?: "" | "auto" | "hint" | "manual";
  }

  // @TODO: https://github.com/ubugeeei-prod/vize/issues/13688 — a `.prop` binding is checked against the element's
  // Attributes, so a DOM property that is no attribute, such as a video's `srcObject`, is unknown. vue-tsc does the
  // Same (vuejs/language-tools#6377), but the app's check is vize's
  interface VideoHTMLAttributes {
    srcObject?: MediaProvider | null;
  }
}

export {};
