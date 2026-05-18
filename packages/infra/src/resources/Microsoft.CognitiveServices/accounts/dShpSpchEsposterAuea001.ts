import ApplicationTags from "@/constants/ApplicationTags";
import AzureAustraliaEastLocation from "@/constants/AzureAustraliaEastLocation";
import { dShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/dShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";

export const dShpSpchEsposterAuea001: azure_native.cognitiveservices.Account =
  new azure_native.cognitiveservices.Account(
    "d-shp-spch-esposter-auea-001",
    {
      accountName: "d-shp-spch-esposter-auea-001",
      identity: {
        type: azure_native.cognitiveservices.ResourceIdentityType.None,
      },
      kind: "SpeechServices",
      location: AzureAustraliaEastLocation,
      properties: {
        networkAcls: {
          defaultAction: azure_native.cognitiveservices.NetworkRuleAction.Allow,
        },
        publicNetworkAccess: azure_native.cognitiveservices.PublicNetworkAccess.Enabled,
      },
      resourceGroupName: dShpRgEsposterAuea001.name,
      sku: {
        name: "F0",
      },
      tags: {
        ...ApplicationTags,
      },
    },
    {
      protect: true,
    },
  );
