export const LineSetter = { LineWidth: "lineWidth", To: "to" } as const;
export type LineSetter = (typeof LineSetter)[keyof typeof LineSetter];
