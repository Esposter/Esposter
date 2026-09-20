import { prodSpchEsposter001 } from "#src/azure/resources/Microsoft.CognitiveServices/accounts/prodSpchEsposter001";
import { prodRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

// The key the persona plugin's Stop hook speaks with, read once off `pulumi stack output --show-secrets` onto the
// One machine that uses it: a personal credential, never a repository secret, so it enters neither ESC nor GitHub
export const prodSpchEsposter001Key: pulumi.Output<string> = pulumi.secret(
  azure_native.cognitiveservices
    .listAccountKeysOutput({ accountName: prodSpchEsposter001.name, resourceGroupName: prodRgEsposterAe001.name })
    .apply(({ key1 }) => key1 ?? ""),
);
