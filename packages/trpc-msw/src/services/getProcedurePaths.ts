// A batched request names every procedure it carries in one comma-separated path segment after the endpoint
export const getProcedurePaths = (url: string, endpointPathname: string): string[] =>
  decodeURIComponent(new URL(url).pathname.slice(endpointPathname.length + 1)).split(",");
