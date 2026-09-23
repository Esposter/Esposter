import { getPageLinkItem } from "@/services/app/getPageLinkItem";

// What a place is called: a product's own name first, since a product page can redirect before its head ever renders a
// Title to record — the messages page opens the last room — then the title its head settled on, then its path
export const getPageLabel = (path: string, title: string) => getPageLinkItem(path)?.title || title || path;
