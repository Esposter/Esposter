// The DOM attributes Vue's element types leave out, and the `data-*` attributes a component passes to
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
}

export {};
