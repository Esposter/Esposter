// "/docs/esbabbler/calls/call-view" → ["/docs/esbabbler", "/docs/esbabbler/calls", "/docs/esbabbler/calls/call-view"]
export const getOpenedNavigationPaths = (path: string): string[] => {
  const segments = path.split("/").filter((segment) => segment.length > 0);
  return segments.slice(1).map((_segment, index) => `/${segments.slice(0, index + 2).join("/")}`);
};
