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

  // @TODO: no upstream issue — vuejs/core: a `.prop` binding is checked against the element's attributes, so a DOM
  // Property that is no attribute, such as a video's `srcObject`, is unknown
  interface VideoHTMLAttributes {
    srcObject?: MediaProvider | null;
  }
}

export {};
