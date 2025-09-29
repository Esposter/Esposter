import { parse } from "node-html-parser";

export const getMentions = (message: string) => parse(message).querySelectorAll("span[data-type='mention']");
