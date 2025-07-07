import { html } from "@@/server/services/prettier/html";

export const getBlobPrefixXml = (name: string): string => html`<BlobPrefix><Name>${name}</Name></BlobPrefix>`;
