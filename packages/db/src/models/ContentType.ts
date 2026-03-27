import { types } from "mime-types";

export const ContentTypes: ReadonlySet<string> = new Set(Object.values(types));
