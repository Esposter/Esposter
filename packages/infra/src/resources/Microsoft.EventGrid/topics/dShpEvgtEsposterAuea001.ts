import ApplicationTags from "@/constants/ApplicationTags";
import AzureAustraliaEastLocation from "@/constants/AzureAustraliaEastLocation";
import { dShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/dShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";

const topicName = "d-shp-evgt-esposter-auea-001";

export const dShpEvgtEsposterAuea001: azure_native.eventgrid.Topic = new azure_native.eventgrid.Topic(
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
    resourceGroupName: dShpRgEsposterAuea001.name,
    tags: {
      ...ApplicationTags,
    },
    topicName,
  },
  {
    protect: true,
  },
);
