import { InvalidOperationError, Operation } from "@esposter/shared";

// Where a kind's article says its drops come from: a drop family, named by the first Drops Table it lists, a Drops
// Template naming an entry of the drops module, or a boss's reward, which its World Boss Rewards template gives. An
// Article naming none of these gives none, as the weekly boss's and the Bathysmal Vishaps' do
export type ArticleDropSource =
  | { family: string; type: "family" }
  | { template: string; type: "template" }
  | { type: "bossReward" }
  | { type: "none" };
// Each Drops Table an article lists, by the type it names, in the order the article lists them
const DROPS_TABLE_TYPE_REGEX = /\{\{Drops Table\|type=(?<family>[^|}]+)/gu;
// Each Drops template an article lists, by the entry of the drops module it names
const DROPS_TEMPLATE_REGEX = /\{\{Drops\|(?<template>[^|}]+)/gu;
// The one drop source an article names. An article naming two kinds of source is an Error, so a kind is never read as
// Dropping from a source its article does not give
export const toArticleDropSource = (articleTitle: string, content: string): ArticleDropSource => {
  const families = [...content.matchAll(DROPS_TABLE_TYPE_REGEX)];
  const templates = [...content.matchAll(DROPS_TEMPLATE_REGEX)];
  const isBossReward = content.includes("{{World Boss Rewards");
  const sourceCount = (families.length > 0 ? 1 : 0) + (templates.length > 0 ? 1 : 0) + (isBossReward ? 1 : 0);
  if (sourceCount > 1) throw new InvalidOperationError(Operation.Read, articleTitle, "names more than one drop source");
  const [firstFamily] = families;
  if (firstFamily?.groups?.family !== undefined) return { family: firstFamily.groups.family.trim(), type: "family" };
  const [firstTemplate] = templates;
  if (firstTemplate?.groups?.template !== undefined)
    return { template: firstTemplate.groups.template.trim(), type: "template" };
  if (isBossReward) return { type: "bossReward" };
  else return { type: "none" };
};
