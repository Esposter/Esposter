import type { HTMLElement } from "node-html-parser";

import { MENTION_SELECTOR } from "@/services/message/constants";
import { parse } from "node-html-parser";

export const getMentions = (message: string): HTMLElement[] => parse(message).querySelectorAll(MENTION_SELECTOR);
