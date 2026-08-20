import { RoutePath } from "@esposter/shared";

// Whether a route path is inside the docs tree. The prefix alone is not the test: `/docsomething` starts with
// It and is another page entirely, so the boundary is the root itself or a path segment under it
export const getIsDocsPath = (path: string) => path === RoutePath.Docs || path.startsWith(`${RoutePath.Docs}/`);
