import ApplicationTags from "@/azure/constants/ApplicationTags";
import AzureAustraliaEastDisplayLocation from "@/azure/constants/AzureAustraliaEastDisplayLocation";
import { prodRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { prodAspEsposterAe001 } from "@/azure/resources/Microsoft.Web/serverFarms/prodAspEsposterAe001";
import * as azure_native from "@pulumi/azure-native";

export const prodFuncEsposter001: azure_native.web.WebApp = new azure_native.web.WebApp(
  "prod-func-esposter-001",
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
        name: "prod-func-esposter-001.azurewebsites.net",
        sslState: azure_native.web.SslState.Disabled,
      },
      {
        hostType: azure_native.web.HostType.Repository,
        name: "prod-func-esposter-001.scm.azurewebsites.net",
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
    name: "prod-func-esposter-001",
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
