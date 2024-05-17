import type { TSESTree } from '@typescript-eslint/utils';
import type { RuleContext } from '../types';
export declare const getAncestors: (context: RuleContext, node: TSESTree.Node) => TSESTree.Node[];
