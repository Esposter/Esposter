import { AzureContainer } from "@/services/azure/types";

/* === route paths === */
export const INDEX_PATH = "/";
export const ABOUT_PATH = "/about";
export const MESSAGES_INDEX_PATH = "/messages";
export const MESSAGES_PATH = (id: string) => `/messages/${id}`;
export const POST_CREATE_PATH = "/post/create";
export const POST_UPDATE_PATH = (id: string) => `/post/update/${id}`;
export const CLICKER_PATH = "/clicker";
export const PRIVACY_POLICY_PATH = "https://www.termsfeed.com/live/367522f3-27be-4faa-a7bd-dda7b419a8fc";
export const TERMS_AND_CONDITIONS_PATH = "https://www.termsfeed.com/live/7202726c-ae87-41cd-af54-9bde6ca4477a";

export const TRPC_CLIENT_PATH = "/api/trpc";

/* === public folder paths === */
const ICONS_FOLDER_PATH = "/icons";
export const FAVICON_32X32_PATH = `${ICONS_FOLDER_PATH}/favicon-32x32.png`;
export const FAVICON_16X16_PATH = `${ICONS_FOLDER_PATH}/favicon-16x16.png`;

const THREED_FOLDER_PATH = "/3D";
export const GEM_GLTF_PATH = `${THREED_FOLDER_PATH}/gem.gltf`;
export const ROUGHNESS_TEXTURE_PATH = `${THREED_FOLDER_PATH}/roughness.jpeg`;

const IMG_FOLDER_PATH = "/img";
export const NOT_FOUND_BACKGROUND = `${IMG_FOLDER_PATH}/404bg.svg`;

const CLICKER_FOLDER_PATH = "/clicker";
export const PINA_COLADA_PATH = `${CLICKER_FOLDER_PATH}/pina-colada.svg`;

/* === Cookie names, yum! C: === */
export const THEME_COOKIE_NAME = "theme";

/* === local storage keys === */
export const CLICKER_STORE = "clicker-store";

export const SITE_NAME = "Esposter";
export const SITE_DESCRIPTION = `${SITE_NAME} is a nice and casual place for posting random things.`;
export const LOGO_IMAGE_PATH = `/${AzureContainer.Assets}/${SITE_NAME}/logo.png`;

export const CLICKER_NAME = "Clicker";
export const CLICKER_UPGRADES_PATH = `/${AzureContainer.Assets}/${CLICKER_NAME}/upgrades.xlsx`;

export const LINKEDIN_PROFILE_URL = "https://www.linkedin.com/in/jimmy-chen-b6216820b";
