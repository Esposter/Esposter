export const MjmlContentKind = { Label: "label", Raw: "raw", RichText: "richText" } as const;
export type MjmlContentKind = (typeof MjmlContentKind)[keyof typeof MjmlContentKind];
