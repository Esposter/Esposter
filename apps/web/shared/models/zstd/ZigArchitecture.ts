export const ZigArchitecture = { Amd64: "x64", Arm64: "arm64" } as const;
export type ZigArchitecture = (typeof ZigArchitecture)[keyof typeof ZigArchitecture];
