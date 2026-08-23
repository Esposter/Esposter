import ApplicationTags from "#src/azure/constants/ApplicationTags";
import AzureAustraliaEastLocation from "#src/azure/constants/AzureAustraliaEastLocation";
import { devRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import * as azure_native from "@pulumi/azure-native";

const namespaceName = "dev-sbns-esposter-001";

export const devSbnsEsposter001: azure_native.servicebus.Namespace = new azure_native.servicebus.Namespace(
  namespaceName,
  {
    location: AzureAustraliaEastLocation,
    minimumTlsVersion: azure_native.servicebus.TlsVersion.TlsVersion_1_2,
    namespaceName,
    resourceGroupName: devRgEsposterAe001.name,
    sku: {
      name: azure_native.servicebus.SkuName.Basic,
      tier: azure_native.servicebus.SkuTier.Basic,
    },
    tags: {
      ...ApplicationTags,
    },
  },
  {
    parent: devRgEsposterAe001,
    protect: true,
  },
);
