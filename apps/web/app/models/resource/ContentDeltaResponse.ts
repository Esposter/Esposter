// A worker's rejection never reaches the page that started it, so a failure is posted back like a result
export type ContentDeltaResponse = { delta: Uint8Array<ArrayBuffer> } | { errorMessage: string };
