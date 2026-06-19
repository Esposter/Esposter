import ApplicationTags from "@/azure/constants/ApplicationTags";
import AzureAustraliaEastLocation from "@/azure/constants/AzureAustraliaEastLocation";
import { devRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import * as azure_native from "@pulumi/azure-native";

const topicName = "dev-evgt-esposter-ae-001";

export const devEvgtEsposterAe001: azure_native.eventgrid.Topic = new azure_native.eventgrid.Topic(
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
    resourceGroupName: devRgEsposterAe001.name,
    tags: {
      ...ApplicationTags,
    },
    topicName,
  },
  {
    parent: devRgEsposterAe001,
    protect: true,
  },
);
