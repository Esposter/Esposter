import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";
import { getBlobUrl } from "#shared/services/azure/container/getBlobUrl";

export const getLogoImageUrl = () => `${getBlobUrl()}/${AzureContainer.AppAssets}/logo.png`;
