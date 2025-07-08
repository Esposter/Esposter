import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";
import { getBlobUrl } from "#shared/util/azure/getBlobUrl";

export const getLogoImageUrl = () => `${getBlobUrl()}/${AzureContainer.EsposterAssets}/logo.png`;
