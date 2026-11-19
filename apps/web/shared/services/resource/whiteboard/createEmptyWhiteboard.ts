import type { WhiteboardResource } from "#shared/models/resource/whiteboard/WhiteboardResource";

// The whiteboard a new one starts from, before its first save
export const createEmptyWhiteboard = (): WhiteboardResource => ({ elements: [] });
