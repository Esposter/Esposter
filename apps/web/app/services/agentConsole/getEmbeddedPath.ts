import { EMBED_QUERY_KEY } from "@/services/app/constants";

// The path an app page is framed at in the side pane, with the embed flag added to whatever query it already has
export const getEmbeddedPath = (path: string) => `${path}${path.includes("?") ? "&" : "?"}${EMBED_QUERY_KEY}`;
