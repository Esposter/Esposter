// The `data-*` attributes a component passes to its root, in the camelCase spelling a component's attribute check reads
// Too. Vue's element types declare none, so this file is the one place that does: the Vue packages' tsconfig includes
// It, and so does the app's, through Nuxt's `typescript.tsConfig.include`
declare module "vue" {
  interface AllowedComponentProps {
    [key: `data-${string}`]: unknown;
    [key: `data${Capitalize<string>}`]: unknown;
  }
}

export {};
