import ApplicationTags from "@/constants/ApplicationTags";
import AzureGlobalDisplayLocation from "@/constants/AzureGlobalDisplayLocation";
import { pShpLogicEsposterAuea003 } from "@/resources/Microsoft.Logic/workflows/pShpLogicEsposterAuea003";
import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

export const prodAgEsposterAuea003: azure_native.monitor.ActionGroup = new azure_native.monitor.ActionGroup(
  "prod-ag-esposter-auea-003",
  {
    actionGroupName: "prod-ag-esposter-auea-003",
    enabled: true,
    groupShortName: "DeleteSub",
    location: AzureGlobalDisplayLocation,
    logicAppReceivers: [
      {
        callbackUrl: config.requireSecret("pShpAgEsposterAuea003CallbackUrl"),
        name: "prod-delete-sub",
        resourceId: pShpLogicEsposterAuea003.id,
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
