import ApplicationTags from "@/constants/ApplicationTags";
import AzureAustraliaEastLocation from "@/constants/AzureAustraliaEastLocation";
import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";

const topicName = "p-shp-evgt-esposter-auea-001";

export const pShpEvgtEsposterAuea001: azure_native.eventgrid.Topic = new azure_native.eventgrid.Topic(
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
    resourceGroupName: pShpRgEsposterAuea001.name,
    tags: {
      ...ApplicationTags,
    },
    topicName,
  },
  {
    protect: true,
  },
);
