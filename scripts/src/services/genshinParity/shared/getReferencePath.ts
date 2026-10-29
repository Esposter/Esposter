import { REFERENCES_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { join } from "node:path";

// Where a reference's screenshot is held, saved as PNG under its id
export const getReferencePath = (referenceId: string): string => join(REFERENCES_DIRECTORY, `${referenceId}.png`);
