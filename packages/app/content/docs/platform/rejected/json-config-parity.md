---
title: JSON/config parity
description: Rejected — Azure's declarative-config surfaces: JSON View, export template, CLI panes.
---

# JSON/config parity (JSON view, export template, CLI panes)

Azure's declarative-config surfaces: the Essentials "JSON View" panel, ARM/Bicep export-template blade, and CLI/Cloud Shell panes.

## Why not

Those exist because Azure resources _are_ declarative JSON documents managed by ARM — viewing/exporting the config is the product. Our resources are app content (rows, surveys, canvases) with no config representation a user would act on; a raw row/blob dump serves nobody but a developer with DB access, who already has better tools.
