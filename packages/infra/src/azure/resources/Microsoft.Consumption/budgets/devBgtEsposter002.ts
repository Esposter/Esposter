import AzureSubscriptionId from "@/azure/constants/AzureSubscriptionId";
import { devAgEsposter001 } from "@/azure/resources/Microsoft.Insights/actionGroups/devAgEsposter001";
import { devAgEsposter003 } from "@/azure/resources/Microsoft.Insights/actionGroups/devAgEsposter003";
import { devRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { getBudgetGuardArguments } from "@/azure/services/getBudgetGuardArguments";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const budgetName = "dev-bgt-esposter-002";

export const devBgtEsposter002: azure_native.consumption.Budget = new azure_native.consumption.Budget(
  budgetName,
  {
    ...getBudgetGuardArguments(devAgEsposter001, devAgEsposter003),
    budgetName,
    scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${devRgEsposterAe001.name}`,
  },
  { protect: true },
);
