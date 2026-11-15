// The router a link type's resources are listed through, named by the resources it lists
export const ResourceLinkRouter = { Email: "email", Survey: "survey" } as const;
export type ResourceLinkRouter = (typeof ResourceLinkRouter)[keyof typeof ResourceLinkRouter];
