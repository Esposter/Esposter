// The image formats a whiteboard exports as, each drawn from the same model
export const WhiteboardExportFormat = { Png: "png", Svg: "svg" } as const;
export type WhiteboardExportFormat = (typeof WhiteboardExportFormat)[keyof typeof WhiteboardExportFormat];
