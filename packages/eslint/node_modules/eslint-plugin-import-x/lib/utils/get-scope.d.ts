import type { TSESTree } from '@typescript-eslint/utils';
import type { RuleContext } from '../types';
export declare const getScope: (context: RuleContext, node: TSESTree.Node) => import("@typescript-eslint/scope-manager").Scope;
