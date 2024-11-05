import { AzureContainer } from "@/shared/models/azure/blob/AzureContainer";

export const SITE_NAME = "Esposter";
export const SITE_DESCRIPTION = `${SITE_NAME} is a nice and casual place for posting random things.`;
export const LOGO_IMAGE_PATH = `/${AzureContainer.EsposterAssets}/${SITE_NAME}/logo.png`;
export const LINKEDIN_PROFILE_URL = "https://www.linkedin.com/in/jimmy-chen-b6216820b";

export const APP_BAR_HEIGHT = 56;

const ICONS_PUBLIC_FOLDER_PATH = "/icons";
export const FAVICON_32X32_PATH = `${ICONS_PUBLIC_FOLDER_PATH}/favicon-32x32.png`;
export const FAVICON_16X16_PATH = `${ICONS_PUBLIC_FOLDER_PATH}/favicon-16x16.png`;

const IMAGES_PUBLIC_FOLDER_PATH = "/images";
export const NOT_FOUND_BACKGROUND_PATH = `${IMAGES_PUBLIC_FOLDER_PATH}/notFoundBackground.svg`;
export const VUEJS_LOGO_UWU_PATH = `${IMAGES_PUBLIC_FOLDER_PATH}/vuejsLogoUWU.png`;

const TILESETS_PUBLIC_FOLDER_PATH = "/tilesets";
export const FIRST_PARTY_FOLDER_PATH = `${TILESETS_PUBLIC_FOLDER_PATH}/firstParty`;
export const AXULART_FOLDER_PATH = `${TILESETS_PUBLIC_FOLDER_PATH}/axulart`;
