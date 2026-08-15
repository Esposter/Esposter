// Every docs map is keyed by slug, while a navigation item carries the full route path it renders under
export const getSlug = (path: string) => path.split("/").at(-1) ?? "";
