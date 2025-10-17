import { getAzureContainerBaseUrl } from "#shared/services/azure/container/getAzureContainerBaseUrl";
import { AzureContainer } from "@esposter/db-schema";

export const getLogoImageUrl = () => `${getAzureContainerBaseUrl()}/${AzureContainer.AppAssets}/logo.png`;
