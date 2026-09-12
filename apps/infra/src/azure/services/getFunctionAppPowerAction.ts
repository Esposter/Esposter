import type { ApiConnectionAction } from "#src/azure/models/ApiConnectionAction";
import type { FunctionAppPowerAction } from "#src/azure/models/FunctionAppPowerAction";

import { HttpMethod } from "#src/azure/models/HttpMethod";
import { getApiConnectionAction } from "#src/azure/services/getApiConnectionAction";
import { getWorkflowResourceGroupPath } from "#src/azure/services/getWorkflowResourceGroupPath";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export const getFunctionAppPowerAction = (
  connection: azure_native.web.Connection,
  resourceGroup: azure_native.resources.ResourceGroup,
  site: azure_native.web.WebApp,
  action: FunctionAppPowerAction,
): ApiConnectionAction =>
  getApiConnectionAction({
    connection,
    method: HttpMethod.Post,
    path: pulumi.interpolate`${getWorkflowResourceGroupPath(resourceGroup)}/Microsoft.Web/sites/@{encodeURIComponent('${site.name}')}/${action}`,
    queries: {
      "api-version": "2019-08-01",
    },
  });
