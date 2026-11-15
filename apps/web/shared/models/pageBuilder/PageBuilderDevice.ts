// The devices the editor draws a webpage at: desktop is the base, and tablet and mobile are the breakpoints the style panel overrides
export const PageBuilderDevice = { Desktop: "Desktop", Mobile: "Mobile", Tablet: "Tablet" } as const;
export type PageBuilderDevice = (typeof PageBuilderDevice)[keyof typeof PageBuilderDevice];
