import { PAGE_TITLE_SEPARATOR } from "#shared/services/app/constants";

// The page's own name, without the product and the site the title template puts before it
export const getPageTitle = (documentTitle: string) => documentTitle.split(PAGE_TITLE_SEPARATOR).at(-1) ?? "";
