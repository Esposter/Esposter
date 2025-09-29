import { MENTION_TYPE, MENTION_TYPE_ATTRIBUTE } from "#shared/services/message/constants";
import { parse } from "node-html-parser";

export const getMentions = (message: string) =>
  parse(message).querySelectorAll(`span[${MENTION_TYPE_ATTRIBUTE}='${MENTION_TYPE}']`);
