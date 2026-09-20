---
title: Official plugin directory
description: Listing the persona plugin in Anthropic's official Claude Code marketplace beside the repository's own.
---

# Official plugin directory

Anthropic runs one central Claude Code marketplace, `claude-plugins-official`, which the tool knows without being added. Its third-party entries are submitted through a form, reviewed against quality and security standards, and point back at the author's own repository, so a listed plugin installs as `genshin-persona@claude-plugins-official` with this repository still the source behind it.

**Why not:** Nothing it adds is needed. There is no name to claim — a plugin is namespaced by its marketplace, so `genshin-persona@esposter` is already the whole identity, and the repository is already a public marketplace whose two install commands are the entire onboarding ([persona plugin](/docs/infra/claude-interface/persona-plugin)). The audience is this machine and whoever reads these docs, so being browsable from the tool's plugin menu buys nothing, and a listing would add a review to pass and a second install name for the same files. A merge to `main` stays the release either way.
