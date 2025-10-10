import { AzureContainer, getBlobUrl } from "@esposter/db-schema";

export const getLogoImageUrl = () => `${getBlobUrl()}/${AzureContainer.AppAssets}/logo.png`;
