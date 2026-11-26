// The `data-*` attributes a component passes to its root, in the camelCase spelling a component's attribute check reads
// Too. Vue's element types declare none, so the Vue packages declare them as the app's `app/types/vue.d.ts` does
declare module "vue" {
  interface AllowedComponentProps {
    [key: `data-${string}`]: unknown;
    [key: `data${Capitalize<string>}`]: unknown;
  }
}

export {};
