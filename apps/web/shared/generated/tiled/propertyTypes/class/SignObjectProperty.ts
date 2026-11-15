export const SignObjectProperty = {
  Message: "message",
} as const;
export type SignObjectProperty = (typeof SignObjectProperty)[keyof typeof SignObjectProperty];
