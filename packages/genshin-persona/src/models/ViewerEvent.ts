// The event types a model notification carries; the only one the viewer documents is a tap on a hit area
export const ViewerEvent = { Tap: 0 } as const;

export type ViewerEvent = (typeof ViewerEvent)[keyof typeof ViewerEvent];
