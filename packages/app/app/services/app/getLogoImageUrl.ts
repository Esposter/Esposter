import { AzureContainer, getBlobUrl } from "@esposter/db";

export const getLogoImageUrl = () => `${getBlobUrl()}/${AzureContainer.AppAssets}/logo.png`;
