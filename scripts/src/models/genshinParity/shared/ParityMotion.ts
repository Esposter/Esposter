// Which motion a shot at times holds: the screen's own animations as it mounts, or the transitions its fixture's
// Motion props start once those have finished
export const ParityMotion = { Entry: "entry", Props: "props" } as const;
export type ParityMotion = (typeof ParityMotion)[keyof typeof ParityMotion];
