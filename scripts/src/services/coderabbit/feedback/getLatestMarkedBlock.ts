import { getMarkedBlock } from "#src/services/coderabbit/feedback/getMarkedBlock";

// The walkthrough is not always the bot's newest comment — a status or rate-limit notice posted after it takes
// That place — so the block is looked for in every body, newest first, rather than in whichever comment sorts
// Last. Reading only the newest is how a merge-risk verdict that exists silently prints nothing.
export const getLatestMarkedBlock = (bodies: string[], marker: string): string | undefined =>
  bodies.map((body) => getMarkedBlock(body, marker)).findLast((block) => block !== undefined);
