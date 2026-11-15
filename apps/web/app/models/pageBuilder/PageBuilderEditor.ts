// The editors a page builder node can be copied from and pasted into
export const PageBuilderEditor = { Email: "Email", Webpage: "Webpage" } as const;
export type PageBuilderEditor = (typeof PageBuilderEditor)[keyof typeof PageBuilderEditor];
