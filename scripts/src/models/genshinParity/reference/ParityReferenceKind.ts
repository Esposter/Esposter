// What a committed reference is drawn from: a wiki file, a frame of a recording, or neither (a file no source names)
export const ParityReferenceKind = { Other: "other", RecordingFrame: "recording-frame", Wiki: "wiki" } as const;
export type ParityReferenceKind = (typeof ParityReferenceKind)[keyof typeof ParityReferenceKind];
