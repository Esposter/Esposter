import type { ContainerClient, ContainerCreateOptions } from "@azure/storage-blob";

export const syncProperties = async (
  containerClient: ContainerClient,
  containerCreateOptions?: ContainerCreateOptions,
) => {
  if (!containerCreateOptions) return;

  const { access } = containerCreateOptions;
  const { blobPublicAccess } = await containerClient.getAccessPolicy();
  if (blobPublicAccess !== access) await containerClient.setAccessPolicy(access);
};
