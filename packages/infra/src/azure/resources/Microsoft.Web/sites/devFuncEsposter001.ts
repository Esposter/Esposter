import ApplicationTags from "#src/azure/constants/ApplicationTags";
import AzureAustraliaEastDisplayLocation from "#src/azure/constants/AzureAustraliaEastDisplayLocation";
import { devEvgtEsposterAe001 } from "#src/azure/resources/Microsoft.EventGrid/topics/devEvgtEsposterAe001";
import { devRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { devAspEsposterAe001 } from "#src/azure/resources/Microsoft.Web/serverFarms/devAspEsposterAe001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const configuration = new pulumi.Config();

const siteName = "dev-func-esposter-001";

export const devFuncEsposter001: azure_native.web.WebApp = new azure_native.web.WebApp(
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
    resourceGroupName: devRgEsposterAe001.name,
    scmSiteAlsoStopped: false,
    serverFarmId: devAspEsposterAe001.id,
    siteConfig: {
      appSettings: [
        { name: "AZURE_EVENT_GRID_TOPIC_ENDPOINT", value: devEvgtEsposterAe001.endpoint },
        {
          name: "AZURE_EVENT_GRID_TOPIC_KEY",
          value: configuration.requireSecret("devFuncEsposter001EventGridTopicKey"),
        },
        {
          name: "AZURE_SERVICE_BUS_CONNECTION_STRING",
          value: configuration.requireSecret("devFuncEsposter001ServiceBusConnectionString"),
        },
        {
          name: "AZURE_STORAGE_ACCOUNT_CONNECTION_STRING",
          value: configuration.requireSecret("devFuncEsposter001StorageAccountConnectionString"),
        },
        {
          name: "AZURE_WEB_PUBSUB_CONNECTION_STRING",
          value: configuration.requireSecret("devFuncEsposter001WebPubSubConnectionString"),
        },
        { name: "AzureWebJobsStorage__blobServiceUri", value: "https://devstesposter001.blob.core.windows.net" },
        { name: "AzureWebJobsStorage__credential", value: "managedidentity" },
        { name: "AzureWebJobsStorage__queueServiceUri", value: "https://devstesposter001.queue.core.windows.net" },
        { name: "AzureWebJobsStorage__tableServiceUri", value: "https://devstesposter001.table.core.windows.net" },
        { name: "BASE_URL", value: "https://esposter-develop.up.railway.app" },
        { name: "DATABASE_URL", value: configuration.requireSecret("devFuncEsposter001DatabaseUrl") },
        { name: "FUNCTIONS_EXTENSION_VERSION", value: "~4" },
        { name: "FUNCTIONS_WORKER_RUNTIME", value: "node" },
        { name: "VAPID_PRIVATE_KEY", value: configuration.requireSecret("devFuncEsposter001VapidPrivateKey") },
        {
          name: "VAPID_PUBLIC_KEY",
          value: "BM7bFHT5jh2S--s_l4pPXGNlmpH-fwrT7RM4-JWYvbafCQkO0g2JeO2gUf_yHFOS-0rY6O6d0X7qkuYWmDiJSPE",
        },
        { name: "WEBSITE_NODE_DEFAULT_VERSION", value: "~24" },
        {
          name: "WEBSITE_RUN_FROM_PACKAGE",
          value: `https://devstesposter001.blob.core.windows.net/${siteName}/release.zip`,
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
    parent: devRgEsposterAe001,
    protect: true,
  },
);
