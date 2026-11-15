export const CaptureResult = { Failure: "Failure", NearMiss: "NearMiss", Success: "Success" } as const;
export type CaptureResult = (typeof CaptureResult)[keyof typeof CaptureResult];
