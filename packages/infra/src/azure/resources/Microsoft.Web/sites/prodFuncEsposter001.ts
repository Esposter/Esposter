import ApplicationTags from "#src/azure/constants/ApplicationTags";
import AzureAustraliaEastDisplayLocation from "#src/azure/constants/AzureAustraliaEastDisplayLocation";
import { prodEvgtEsposterAe001 } from "#src/azure/resources/Microsoft.EventGrid/topics/prodEvgtEsposterAe001";
import { prodRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { prodAspEsposterAe001 } from "#src/azure/resources/Microsoft.Web/serverFarms/prodAspEsposterAe001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const configuration = new pulumi.Config();

const siteName = "prod-func-esposter-001";

export const prodFuncEsposter001: azure_native.web.WebApp = new azure_native.web.WebApp(
  siteName,
  {
    clientAffinityEnabled: false,
    clientAffinityProxyEnabled: false,
    clientCertEnabled: false,
    clientCertMode: azure_native.web.ClientCertMode.Required,
    containerSize: 1536,
    customDomainVerificationId: "2056A3EEB73FBB528BC43CDFDCC87B0ED9A0C4C7C520BE7663108B19B35289C8",
    dailyMemoryTimeQuota: 0,
    enabled: true,
    endToEndEncryptionEnabled: false,
    hostNamesDisabled: false,
    hostNameSslStates: [
      {
        hostType: azure_native.web.HostType.Standard,
        name: `${siteName}.azurewebsites.net`,
        sslState: azure_native.web.SslState.Disabled,
      },
      {
        hostType: azure_native.web.HostType.Repository,
        name: `${siteName}.scm.azurewebsites.net`,
        sslState: azure_native.web.SslState.Disabled,
      },
    ],
    httpsOnly: true,
    hyperV: false,
    identity: {
      type: azure_native.web.ManagedServiceIdentityType.SystemAssigned,
    },
    ipMode: azure_native.web.IPMode.IPv4,
    isXenon: false,
    keyVaultReferenceIdentity: "SystemAssigned",
    kind: "functionapp",
    location: AzureAustraliaEastDisplayLocation,
    name: siteName,
    outboundVnetRouting: {
      allTraffic: false,
      applicationTraffic: false,
      backupRestoreTraffic: false,
      contentShareTraffic: false,
      imagePullTraffic: false,
    },
    publicNetworkAccess: "Enabled",
    redundancyMode: azure_native.web.RedundancyMode.None,
    reserved: false,
    resourceGroupName: prodRgEsposterAe001.name,
    scmSiteAlsoStopped: false,
    serverFarmId: prodAspEsposterAe001.id,
    siteConfig: {
      appSettings: [
        { name: "AZURE_EVENT_GRID_TOPIC_ENDPOINT", value: prodEvgtEsposterAe001.endpoint },
        {
          name: "AZURE_EVENT_GRID_TOPIC_KEY",
          value: configuration.requireSecret("prodFuncEsposter001EventGridTopicKey"),
        },
        {
          name: "AZURE_SERVICE_BUS_CONNECTION_STRING",
          value: configuration.requireSecret("prodFuncEsposter001ServiceBusConnectionString"),
        },
        {
          name: "AZURE_STORAGE_ACCOUNT_CONNECTION_STRING",
          value: configuration.requireSecret("prodFuncEsposter001StorageAccountConnectionString"),
        },
        {
          name: "AZURE_WEB_PUBSUB_CONNECTION_STRING",
          value: configuration.requireSecret("prodFuncEsposter001WebPubSubConnectionString"),
        },
        { name: "AzureWebJobsStorage__blobServiceUri", value: "https://prodstesposter001.blob.core.windows.net" },
        { name: "AzureWebJobsStorage__credential", value: "managedidentity" },
        { name: "AzureWebJobsStorage__queueServiceUri", value: "https://prodstesposter001.queue.core.windows.net" },
        { name: "AzureWebJobsStorage__tableServiceUri", value: "https://prodstesposter001.table.core.windows.net" },
        { name: "BASE_URL", value: "https://esposter.com" },
        { name: "DATABASE_URL", value: configuration.requireSecret("prodFuncEsposter001DatabaseUrl") },
        { name: "FUNCTIONS_EXTENSION_VERSION", value: "~4" },
        { name: "FUNCTIONS_WORKER_RUNTIME", value: "node" },
        { name: "VAPID_PRIVATE_KEY", value: configuration.requireSecret("prodFuncEsposter001VapidPrivateKey") },
        {
          name: "VAPID_PUBLIC_KEY",
          value: "BMNNrnbyB172jBomt7_Iv1br_r7WHn9fun4faYpZNZYScxFBVt5xhAdNy8zD4UaqbNXZHuzg19Q08zVBtBVXyas",
        },
        { name: "WEBSITE_NODE_DEFAULT_VERSION", value: "~24" },
        {
          name: "WEBSITE_RUN_FROM_PACKAGE",
          value: `https://prodstesposter001.blob.core.windows.net/${siteName}/release.zip`,
        },
      ],
      use32BitWorkerProcess: false,
    },
    storageAccountRequired: false,
    tags: {
      ...ApplicationTags,
    },
  },
  {
    parent: prodRgEsposterAe001,
    protect: true,
  },
);
