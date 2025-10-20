import { html } from "@esposter/shared";

export const getBlobPrefixXml = (name: string): string => html`<BlobPrefix><Name>${name}</Name></BlobPrefix>`;
