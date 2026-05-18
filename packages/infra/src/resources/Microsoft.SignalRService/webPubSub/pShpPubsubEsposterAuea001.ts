import ApplicationTags from "@/constants/ApplicationTags";
import AzureAustraliaEastLocation from "@/constants/AzureAustraliaEastLocation";
import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";

const resourceName = "p-shp-pubsub-esposter-auea-001";

export const pShpPubsubEsposterAuea001: azure_native.webpubsub.WebPubSub = new azure_native.webpubsub.WebPubSub(
  resourceName,
  {
    disableAadAuth: false,
    disableLocalAuth: false,
    kind: azure_native.webpubsub.ServiceKind.WebPubSub,
    location: AzureAustraliaEastLocation,
    networkACLs: {
      defaultAction: azure_native.webpubsub.ACLAction.Deny,
      ipRules: [
        {
          action: azure_native.webpubsub.ACLAction.Allow,
          value: "0.0.0.0/0",
        },
        {
          action: azure_native.webpubsub.ACLAction.Allow,
          value: "::/0",
        },
      ],
      publicNetwork: {
        allow: [
          azure_native.webpubsub.WebPubSubRequestType.ServerConnection,
          azure_native.webpubsub.WebPubSubRequestType.ClientConnection,
          azure_native.webpubsub.WebPubSubRequestType.RESTAPI,
          azure_native.webpubsub.WebPubSubRequestType.Trace,
        ],
      },
    },
    publicNetworkAccess: "Enabled",
    regionEndpointEnabled: "Enabled",
    resourceGroupName: pShpRgEsposterAuea001.name,
    resourceName: resourceName,
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
    protect: true,
  },
);
