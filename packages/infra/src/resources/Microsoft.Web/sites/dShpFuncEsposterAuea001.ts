import ApplicationTags from "@/constants/ApplicationTags";
import AzureAustraliaEastDisplayLocation from "@/constants/AzureAustraliaEastDisplayLocation";
import { dShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/dShpRgEsposterAuea001";
import { aspDshprgesposterauea00194fb } from "@/resources/Microsoft.Web/serverFarms/aspDshprgesposterauea00194fb";
import * as azure_native from "@pulumi/azure-native";

export const dShpFuncEsposterAuea001: azure_native.web.WebApp = new azure_native.web.WebApp(
  "d-shp-func-esposter-auea-001",
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
        name: "d-shp-func-esposter-auea-001.azurewebsites.net",
        sslState: azure_native.web.SslState.Disabled,
      },
      {
        hostType: azure_native.web.HostType.Repository,
        name: "d-shp-func-esposter-auea-001.scm.azurewebsites.net",
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
    name: "d-shp-func-esposter-auea-001",
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
    resourceGroupName: dShpRgEsposterAuea001.name,
    scmSiteAlsoStopped: false,
    serverFarmId: aspDshprgesposterauea00194fb.id,
    storageAccountRequired: false,
    tags: {
      ...ApplicationTags,
    },
  },
  {
    protect: true,
  },
);
