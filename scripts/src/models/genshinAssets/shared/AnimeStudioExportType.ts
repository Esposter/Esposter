// How AnimeStudio writes an object it exports: its fields as JSON where the blocks' type data names them, or its
// Serialized bytes as they are
export const AnimeStudioExportType = { Json: "JSON", Raw: "Raw" } as const;
export type AnimeStudioExportType = (typeof AnimeStudioExportType)[keyof typeof AnimeStudioExportType];
