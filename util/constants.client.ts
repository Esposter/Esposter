import { AzureContainer } from "@/services/azure/types";

export const INDEX_PATH = "/";
export const ABOUT_PATH = "/about";
export const MESSAGES_PATH = (id: string) => `/messages/${id}`;
export const POST_CREATE_PATH = "/post/create";
export const PRIVACY_POLICY_PATH = "https://www.termsfeed.com/live/367522f3-27be-4faa-a7bd-dda7b419a8fc";
export const TERMS_AND_CONDITIONS_PATH = "https://www.termsfeed.com/live/7202726c-ae87-41cd-af54-9bde6ca4477a";

export const TRPC_CLIENT_PATH = "/api/trpc";

// public folder paths
const ICONS_FOLDER_PATH = "/icons";
export const FAVICON_32X32_PATH = `${ICONS_FOLDER_PATH}/favicon-32x32.png`;
export const FAVICON_16X16_PATH = `${ICONS_FOLDER_PATH}/favicon-16x16.png`;

const THREED_FOLDER_PATH = "/3D";
export const GEM_GLTF_PATH = `${THREED_FOLDER_PATH}/gem.gltf`;
export const ROUGHNESS_TEXTURE_PATH = `${THREED_FOLDER_PATH}/roughness.jpeg`;

// cookie names, yum! C:
export const THEME_COOKIE_NAME = "theme";

export const AZURE_BLOB_URL_PROD = "https://pshpstespauea001.blob.core.windows.net";
export const AZURE_BLOB_URL_DEV = "https://dshpstespauea001.blob.core.windows.net";

export const LOGO_IMAGE_PATH = `/${AzureContainer.Assets}/Esposter/logo.png`;

export const SITE_DOMAIN_PROD = "https://esposter.com";
export const SITE_DOMAIN_DEV = "http://localhost:3000";
