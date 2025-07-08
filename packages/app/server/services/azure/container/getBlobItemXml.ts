import type { BlobItem } from "@azure/storage-blob";

import { html } from "#shared/services/prettier/html";

export const getBlobItemXml = ({ name, properties }: BlobItem): string =>
  html`<Blob>
    <Name>${name}</Name>
    <Properties>
      <Last-Modified>${properties.lastModified.toUTCString()}</Last-Modified>
      <Etag>${properties.etag}</Etag>
      <Content-Length>${properties.contentLength}</Content-Length>
      <Content-Type>${properties.contentType}</Content-Type>
      <BlobType>BlockBlob</BlobType>
      <LeaseStatus>unlocked</LeaseStatus>
      <LeaseState>available</LeaseState>
    </Properties>
  </Blob>`;
