export const SITE_NAME = "Esposter";
export const SITE_DESCRIPTION = `${SITE_NAME} is a nice and casual place for posting random things.`;
export const LINKEDIN_PROFILE_URL = "https://www.linkedin.com/in/jimmy-chen-b6216820b";

export const LEFT_DRAWER_WIDTH = 256;
export const RIGHT_DRAWER_WIDTH = 256;
// Declared here rather than imported from @esposter/shared, which also has them: this file is pulled into
// `nuxt.config` by configuration/{site,pwa}.ts, and importing the package barrel there drags the whole runtime
// Graph (zod, neverthrow, node-html-parser) into config evaluation
export const KIBIBYTE = 2 ** 10;
export const MEGABYTE = KIBIBYTE ** 2;
export const GIBIBYTE = MEGABYTE * KIBIBYTE;
export const MAX_REQUEST_SIZE = 2 * MEGABYTE;
export const MAX_FILE_REQUEST_SIZE = 10 * MEGABYTE;

export const PWA_PUBLIC_FOLDER_PATH = "/pwa";

const IMAGES_PUBLIC_FOLDER_PATH = "/images";
export const VUEJS_LOGO_UWU_PATH = `${IMAGES_PUBLIC_FOLDER_PATH}/vuejsLogoUWU.png`;

const TILESETS_PUBLIC_FOLDER_PATH = "/tilesets";
export const FIRST_PARTY_FOLDER_PATH = `${TILESETS_PUBLIC_FOLDER_PATH}/firstParty`;
export const AXULART_FOLDER_PATH = `${TILESETS_PUBLIC_FOLDER_PATH}/axulart`;
// Between the parts of a document title, broadest first, so its last part names the page itself
export const PAGE_TITLE_SEPARATOR = " | ";
