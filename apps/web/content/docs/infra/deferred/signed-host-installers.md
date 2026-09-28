---
title: Signed host installers
description: A code-signed Windows installer and the macOS and Linux builds of the agent console's host — deferred while the installer ships for Windows alone and unsigned, since signing and notarization each cost a yearly fee.
---

# Signed Host Installers

**What it was.** The [host installer](/docs/proposals/infra/agent-console/host-installer) built for every platform Node's single executables are tested on, with the Windows build signed so SmartScreen trusts it and the macOS build signed and notarized so Gatekeeper opens it.

**Why deferred.** Each costs money: a Windows code-signing certificate or a signing service is a recurring fee, and signing and notarizing for macOS needs a paid Apple Developer membership. The console is worked on Windows today, so the installer ships for Windows alone, unsigned. An unsigned executable still runs after a single SmartScreen prompt, which the pairing screen warns of beside the download.

**Revisit when:** the console has a reader outside this repository, for whom a SmartScreen warning reads as malware, or a reader who works on macOS or Linux.

**Cheaper interim:** the unsigned Windows installer, and the `pnpm dlx agent-console-server` command on any other platform.
