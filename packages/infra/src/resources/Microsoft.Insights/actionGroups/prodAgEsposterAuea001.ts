import ApplicationTags from "@/constants/ApplicationTags";
import AzureGlobalDisplayLocation from "@/constants/AzureGlobalDisplayLocation";
import { prodLogicEsposterAuea001 } from "@/resources/Microsoft.Logic/workflows/prodLogicEsposterAuea001";
import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

export const prodAgEsposterAuea001: azure_native.monitor.ActionGroup = new azure_native.monitor.ActionGroup(
  "prod-ag-esposter-auea-001",
  {
    actionGroupName: "prod-ag-esposter-auea-001",
    enabled: true,
    groupShortName: "StopFunction",
    location: AzureGlobalDisplayLocation,
    logicAppReceivers: [
      {
        callbackUrl: config.requireSecret("prodAgEsposterAuea001CallbackUrl"),
        name: "prod-stop-function",
        resourceId: prodLogicEsposterAuea001.id,
        useCommonAlertSchema: true,
      },
    ],
    resourceGroupName: pShpRgEsposterAuea001.name,
    tags: {
      ...ApplicationTags,
    },
  },
  {
    protect: true,
  },
);
