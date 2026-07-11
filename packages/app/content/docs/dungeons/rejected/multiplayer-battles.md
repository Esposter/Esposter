---
title: Multiplayer battles
description: Real-time PvP battles between users' parties.
---

# Multiplayer Battles

PvP battles between users, riding the platform's real-time infrastructure (WebPubSub).

**Why not:** The battle engine is a client-local state machine over a client-authoritative save — PvP would require a server-authoritative battle simulation, matchmaking, and anti-forgery for monster stats, an order of magnitude more infrastructure than a casual single-player mini-game justifies. Esposter's social layer is esbabbler; dungeons doesn't need to duplicate it.
