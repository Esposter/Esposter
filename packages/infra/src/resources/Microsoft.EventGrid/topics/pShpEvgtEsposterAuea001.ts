import * as azure_native from "@pulumi/azure-native";

export const pShpEvgtEsposterAuea001: azure_native.eventgrid.Topic = new azure_native.eventgrid.Topic(
  "p-shp-evgt-esposter-auea-001",
  {
    dataResidencyBoundary: azure_native.eventgrid.DataResidencyBoundary.WithinRegion,
    disableLocalAuth: false,
    identity: {
      type: azure_native.eventgrid.IdentityType.None,
    },
    inputSchema: azure_native.eventgrid.InputSchema.EventGridSchema,
    location: "australiaeast",
    minimumTlsVersionAllowed: azure_native.eventgrid.TlsVersion.TlsVersion_1_2,
    publicNetworkAccess: azure_native.eventgrid.PublicNetworkAccess.Enabled,
    resourceGroupName: "p-shp-rg-esposter-auea-001",
    tags: {
      Application: "Esposter",
    },
    topicName: "p-shp-evgt-esposter-auea-001",
  },
  {
    protect: true,
  },
);
