---
title: Blueprint deployment history
description: Deferred — a list on the blueprint of every deploy it ran, with its parameter values and the resources it created, as Azure's deployment history keeps.
---

# Blueprint Deployment History

Azure keeps every template deployment in a resource group's deployment history — the template, the parameter values and what it created. Here it would be a Deployments blade on a blueprint listing each deploy with its time, its parameter values and links to the resources it made, so "which clients has this funnel been deployed for" is answered on the blueprint.

## Why deferred

A deployed resource carries no link back to its blueprint, by design ([blueprint resource](/docs/resource/blueprint-resource)): editing a blueprint never touches past deployments. A history is a second record beside the resources themselves, needing its own table, its own cleanup when a deployed resource is deleted or purged, and its own answer when the blueprint is. The deploy dialog already lists what one deploy created, and each created resource's activity log records its creation.

## Revisit when

An owner deploys one blueprint often enough to lose track of its deployments — the survey funnel per client is the case to watch.

## Cheaper interim

Put the parameter in the entry names (`Survey — {{parameter:client}}`) and search the explorer for it; tag deployed resources by editing their tags after the deploy.
