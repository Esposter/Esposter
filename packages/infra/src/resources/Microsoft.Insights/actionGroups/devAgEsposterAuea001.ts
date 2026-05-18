import ApplicationTags from "@/constants/ApplicationTags";
import AzureGlobalDisplayLocation from "@/constants/AzureGlobalDisplayLocation";
import { devLogicEsposterAuea001 } from "@/resources/Microsoft.Logic/workflows/devLogicEsposterAuea001";
import { dShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/dShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

export const devAgEsposterAuea001: azure_native.monitor.ActionGroup = new azure_native.monitor.ActionGroup(
  "dev-ag-esposter-auea-001",
  {
    actionGroupName: "dev-ag-esposter-auea-001",
    enabled: true,
    groupShortName: "StopFunction",
    location: AzureGlobalDisplayLocation,
    logicAppReceivers: [
      {
        callbackUrl: config.requireSecret("devAgEsposterAuea001CallbackUrl"),
        name: "dev-stop-function",
        resourceId: devLogicEsposterAuea001.id,
        useCommonAlertSchema: true,
      },
    ],
    resourceGroupName: dShpRgEsposterAuea001.name,
    tags: {
      ...ApplicationTags,
    },
  },
  {
    protect: true,
  },
);
