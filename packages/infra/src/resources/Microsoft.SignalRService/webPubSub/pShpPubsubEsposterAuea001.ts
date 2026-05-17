import * as azure_native from "@pulumi/azure-native";

export const pShpPubsubEsposterAuea001: azure_native.webpubsub.WebPubSub = new azure_native.webpubsub.WebPubSub(
  "p-shp-pubsub-esposter-auea-001",
  {
    disableAadAuth: false,
    disableLocalAuth: false,
    kind: azure_native.webpubsub.ServiceKind.WebPubSub,
    location: "australiaeast",
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
    resourceGroupName: "p-shp-rg-esposter-auea-001",
    resourceName: "p-shp-pubsub-esposter-auea-001",
    resourceStopped: "false",
    sku: {
      capacity: 1,
      name: "Free_F1",
      tier: azure_native.webpubsub.WebPubSubSkuTier.Free,
    },
    tags: {
      Application: "Esposter",
    },
    tls: {
      clientCertEnabled: false,
    },
  },
  {
    protect: true,
  },
);
