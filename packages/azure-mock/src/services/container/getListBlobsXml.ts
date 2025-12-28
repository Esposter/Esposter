import { html } from "@esposter/shared";
/**
 * Generates a standard Azure Storage list blobs XML response body.
 * @param containerName The container name.
 * @param blobsXml The blobs xml data.
 * @returns A formatted XML string.
 */
export const getListBlobsXml = (containerName: string, blobsXml: string): string =>
  html`<?xml version="1.0" encoding="utf8"?>
    <EnumerationResults ServiceEndpoint="" ContainerName="${containerName}">
      <Blobs>${blobsXml}</Blobs>
      <NextMarker />
    </EnumerationResults>`;
