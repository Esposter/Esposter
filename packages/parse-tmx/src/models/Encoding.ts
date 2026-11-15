export const Encoding = { Base64: "base64", Csv: "csv" } as const;
export type Encoding = (typeof Encoding)[keyof typeof Encoding];
