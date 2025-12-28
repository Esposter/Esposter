import type { HTMLElement } from "node-html-parser";

import { MENTION_TYPE, MENTION_TYPE_ATTRIBUTE } from "@/services/message/constants";
import { parse } from "node-html-parser";

export const getMentions = (message: string): HTMLElement[] =>
  parse(message).querySelectorAll(`span[${MENTION_TYPE_ATTRIBUTE}='${MENTION_TYPE}']`);
