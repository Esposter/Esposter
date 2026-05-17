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
      location: "australiaeast",
      properties: {
        networkAcls: {
          defaultAction: azure_native.cognitiveservices.NetworkRuleAction.Allow,
        },
        publicNetworkAccess: azure_native.cognitiveservices.PublicNetworkAccess.Enabled,
      },
      resourceGroupName: "d-shp-rg-esposter-auea-001",
      sku: {
        name: "F0",
      },
      tags: {
        Application: "Eslife",
      },
    },
    {
      protect: true,
    },
  );
