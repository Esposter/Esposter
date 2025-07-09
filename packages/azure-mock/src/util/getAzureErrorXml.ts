import { html } from "@esposter/shared"; // Assuming you have this helper

/**
 * Generates a standard Azure Storage error XML response body.
 * @param errorCode The official Azure error code (e.g., "BlobNotFound").
 * @param errorMessage The user-friendly error message.
 * @returns A formatted XML string.
 */
export const getAzureErrorXml = (errorCode: string, errorMessage: string): string =>
  html`<?xml version="1.0" encoding="utf-8"?>
    <Error>
      <code>${errorCode}</code>
      <Message>${errorMessage}</Message>
    </Error>`;
