import { getBlobUrl } from "#shared/services/azure/container/getBlobUrl";
import { AzureContainer } from "@esposter/db-schema";

export const getLogoImageUrl = () => `${getBlobUrl()}/${AzureContainer.AppAssets}/logo.png`;
