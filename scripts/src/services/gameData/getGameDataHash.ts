import { getContentAddress } from "keyframe-store";

// The name an object is stored under: the sha256 of its compact JSON, so a value that serializes the same way on every
// Machine is named the same way and a change of compression level never renames it
export const getGameDataHash = (json: string): string => getContentAddress(Buffer.from(json));
