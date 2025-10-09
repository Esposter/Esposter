import { AzureContainer } from "#shared/models/azure/container/AzureContainer";
import { getBlobUrl } from "#shared/services/azure/container/getBlobUrl";

export const getLogoImageUrl = () => `${getBlobUrl()}/${AzureContainer.AppAssets}/logo.png`;
