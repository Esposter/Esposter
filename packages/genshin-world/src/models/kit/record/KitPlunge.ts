// The plunges a kit lands, by the height of the drop it lands from
export const KitPlunge = { High: "high", Low: "low" } as const;
export type KitPlunge = (typeof KitPlunge)[keyof typeof KitPlunge];
