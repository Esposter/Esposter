import { AzureContainer } from "@/models/azure/blob";

// #region Site constants
export const SITE_NAME = "Esposter";
export const SITE_DESCRIPTION = `${SITE_NAME} is a nice and casual place for posting random things.`;
export const LOGO_IMAGE_PATH = `/${AzureContainer.EsposterAssets}/${SITE_NAME}/logo.png`;

export const LINKEDIN_PROFILE_URL = "https://www.linkedin.com/in/jimmy-chen-b6216820b";
// #endregion

// #region Cookie name constants, yum! C:
export const THEME_COOKIE_NAME = "theme";
// #endregion

// #region public folder path constants
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
// #endregion
