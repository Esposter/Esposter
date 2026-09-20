import ApplicationTags from "#src/azure/constants/ApplicationTags";
import AzureAustraliaEastLocation from "#src/azure/constants/AzureAustraliaEastLocation";
import { prodRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import * as azure_native from "@pulumi/azure-native";

const accountName = "prod-spch-esposter-001";

// The one free-tier speech resource a subscription allows, so it has no dev twin: it serves the persona plugin's
// Spoken replies on a personal machine, read through its key rather than an identity
export const prodSpchEsposter001: azure_native.cognitiveservices.Account = new azure_native.cognitiveservices.Account(
  accountName,
  {
    accountName,
    kind: "SpeechServices",
    location: AzureAustraliaEastLocation,
    properties: {
      publicNetworkAccess: azure_native.cognitiveservices.PublicNetworkAccess.Enabled,
    },
    resourceGroupName: prodRgEsposterAe001.name,
    sku: {
      name: "F0",
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
