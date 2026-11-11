import { Environment } from "#shared/models/environment/Environment";
import { checkIsLocalUrl } from "@esposter/shared";

// The route answers only where the server is not in production and the database it reads is on this machine. Both are
// Read when the request arrives, so a request is judged by the environment the server is running with, never the one it
// Was started with, and no variable enables the route on its own
export const checkIsDevSessionOpen = (): boolean =>
  process.env.APP_ENV !== Environment.Production && checkIsLocalUrl(process.env.DATABASE_URL);
