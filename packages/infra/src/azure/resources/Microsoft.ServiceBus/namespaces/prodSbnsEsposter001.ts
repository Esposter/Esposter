import ApplicationTags from "@/azure/constants/ApplicationTags";
import AzureAustraliaEastLocation from "@/azure/constants/AzureAustraliaEastLocation";
import { prodRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import * as azure_native from "@pulumi/azure-native";

const namespaceName = "prod-sbns-esposter-001";

export const prodSbnsEsposter001: azure_native.servicebus.Namespace = new azure_native.servicebus.Namespace(
  namespaceName,
  {
    location: AzureAustraliaEastLocation,
    minimumTlsVersion: azure_native.servicebus.TlsVersion.TlsVersion_1_2,
    namespaceName,
    resourceGroupName: prodRgEsposterAe001.name,
    sku: {
      name: azure_native.servicebus.SkuName.Basic,
      tier: azure_native.servicebus.SkuTier.Basic,
    },
    tags: {
      ...ApplicationTags,
    },
  },
  {
    parent: prodRgEsposterAe001,
    protect: true,
  },
);
