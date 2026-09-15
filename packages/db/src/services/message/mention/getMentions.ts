import type { HTMLElement } from "node-html-parser";

import { MENTION_SELECTOR } from "@esposter/shared";
import { parse } from "node-html-parser";

export const getMentions = (message: string): HTMLElement[] => parse(message).querySelectorAll(MENTION_SELECTOR);
