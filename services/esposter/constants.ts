import { AzureContainer } from "@/models/azure/blob";

export const SITE_NAME = "Esposter";
export const SITE_DESCRIPTION = `${SITE_NAME} is a nice and casual place for posting random things.`;
export const LOGO_IMAGE_PATH = `/${AzureContainer.EsposterAssets}/${SITE_NAME}/logo.png`;
export const LINKEDIN_PROFILE_URL = "https://www.linkedin.com/in/jimmy-chen-b6216820b";

export const APP_BAR_HEIGHT = 56;

const ICONS_PUBLIC_FOLDER_PATH = "/icons";
export const FAVICON_32X32_PATH = `${ICONS_PUBLIC_FOLDER_PATH}/favicon-32x32.png`;
export const FAVICON_16X16_PATH = `${ICONS_PUBLIC_FOLDER_PATH}/favicon-16x16.png`;

const IMG_PUBLIC_FOLDER_PATH = "/img";
export const NOT_FOUND_BACKGROUND = `${IMG_PUBLIC_FOLDER_PATH}/404bg.svg`;
