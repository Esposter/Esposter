## Why

A published webpage is open to search engines the moment it is published, and its owner has no way to say otherwise. A page shared by link to a client, or a draft of a landing page published to be previewed, turns up in search results. The reference controls crawling per page with a noindex tag.

## What Changes

- The webpage's Settings blade takes a **Show in search results** switch, on until the owner turns it off.
- A published webpage whose switch is off tells search engines not to list it.
- A page that is on says nothing, as every published page does today.
- The setting is saved with the webpage's other settings, so it follows the page through publish and restore.

## Capabilities

### New Capabilities

- webpage-search-visibility (resource/webpage-search-visibility): the owner's choice of whether a published webpage is listed by search engines.

## Impact

The webpage settings gain one boolean and the Settings blade one switch. The published page sets a robots directive in its head when the switch is off. A stored webpage without the field reads on, so no stored page changes.
