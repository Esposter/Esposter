import AzureSubscriptionId from "#src/azure/constants/AzureSubscriptionId";
import { devAgEsposter001 } from "#src/azure/resources/Microsoft.Insights/actionGroups/devAgEsposter001";
import { devAgEsposter003 } from "#src/azure/resources/Microsoft.Insights/actionGroups/devAgEsposter003";
import { devRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { devFuncEsposter001 } from "#src/azure/resources/Microsoft.Web/sites/devFuncEsposter001";
import { getBudgetGuardArguments } from "#src/azure/services/getBudgetGuardArguments";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const budgetName = "dev-bgt-esposter-001";

export const devBgtEsposter001: azure_native.consumption.Budget = new azure_native.consumption.Budget(
  budgetName,
  {
    ...getBudgetGuardArguments(devAgEsposter001, devAgEsposter003),
    budgetName,
    filter: {
      dimensions: {
        name: "ResourceId",
        operator: azure_native.consumption.BudgetOperatorType.In,
        values: [devFuncEsposter001.id],
      },
    },
    scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${devRgEsposterAe001.name}`,
  },
  { protect: true },
);
