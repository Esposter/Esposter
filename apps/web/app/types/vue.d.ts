// The DOM attributes Vue's element types leave out. The `data-*` attributes a component passes to its root are
// Declared once, in `packages/configuration/types/vue`, which the app's tsconfig includes
declare module "vue" {
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
