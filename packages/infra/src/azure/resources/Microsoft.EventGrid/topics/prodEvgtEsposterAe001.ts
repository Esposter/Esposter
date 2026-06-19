import ApplicationTags from "@/azure/constants/ApplicationTags";
import AzureAustraliaEastLocation from "@/azure/constants/AzureAustraliaEastLocation";
import { prodRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import * as azure_native from "@pulumi/azure-native";

const topicName = "prod-evgt-esposter-ae-001";

export const prodEvgtEsposterAe001: azure_native.eventgrid.Topic = new azure_native.eventgrid.Topic(
  topicName,
  {
    dataResidencyBoundary: azure_native.eventgrid.DataResidencyBoundary.WithinRegion,
    disableLocalAuth: false,
    identity: {
      type: azure_native.eventgrid.IdentityType.None,
    },
    inputSchema: azure_native.eventgrid.InputSchema.EventGridSchema,
    location: AzureAustraliaEastLocation,
    minimumTlsVersionAllowed: azure_native.eventgrid.TlsVersion.TlsVersion_1_2,
    publicNetworkAccess: azure_native.eventgrid.PublicNetworkAccess.Enabled,
    resourceGroupName: prodRgEsposterAe001.name,
    tags: {
      ...ApplicationTags,
    },
    topicName,
  },
  {
    parent: prodRgEsposterAe001,
    protect: true,
  },
);
