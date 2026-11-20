import { getResourceSearchMatch } from "#src/services/resource/getResourceSearchMatch";

// The same match restricted to the name column, which orders a name match above a row matched only by a tag
export const getResourceNameSearchMatch = (expression: string) => getResourceSearchMatch(`name : (${expression})`);
