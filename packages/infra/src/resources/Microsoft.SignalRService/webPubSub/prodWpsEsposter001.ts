import ApplicationTags from "@/constants/ApplicationTags";
import AzureAustraliaEastLocation from "@/constants/AzureAustraliaEastLocation";
import { prodRgEsposterAe001 } from "@/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import * as azure_native from "@pulumi/azure-native";

const resourceName = "prod-wps-esposter-001";

export const prodWpsEsposter001: azure_native.webpubsub.WebPubSub = new azure_native.webpubsub.WebPubSub(
  resourceName,
  {
    disableAadAuth: false,
    disableLocalAuth: false,
    kind: azure_native.webpubsub.ServiceKind.WebPubSub,
    location: AzureAustraliaEastLocation,
    publicNetworkAccess: "Enabled",
    regionEndpointEnabled: "Enabled",
    resourceGroupName: prodRgEsposterAe001.name,
    resourceName,
    resourceStopped: "false",
    sku: {
      capacity: 1,
      name: "Free_F1",
      tier: azure_native.webpubsub.WebPubSubSkuTier.Free,
    },
    tags: {
      ...ApplicationTags,
    },
    tls: {
      clientCertEnabled: false,
    },
  },
  {
    parent: prodRgEsposterAe001,
    protect: true,
  },
);
