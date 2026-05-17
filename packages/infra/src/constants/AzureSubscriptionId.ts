import { Config } from "@pulumi/pulumi";

const azureNativeConfig = new Config("azure-native");
const AzureSubscriptionId: string = azureNativeConfig.require("subscriptionId");

export default AzureSubscriptionId;
