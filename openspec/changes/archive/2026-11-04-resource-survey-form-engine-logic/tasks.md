# Tasks

Build order. The tokenizer and parser are the pilot unit; the rest wait on the tree they return.

## 1. Parse

- [x] 1.1 Write the models and the tokenizer and parser. Test-first, one case per scenario in the spec delta and one per operator and literal.
      Verify: the package's parser tests pass, a malformed expression returns a positioned error, and `pnpm build` regenerates the barrel.

## 2. Evaluate

- [x] 2.1 Write the evaluator, the operators, the empty and coercion rules, and `runSurveyExpression` and `checkSurveyExpression`.
      Verify: each scenario in the spec delta is a test, and a reference to an unanswered question is empty.
- [x] 2.2 Write the date and number functions of SurveyJS's registry, each in its own module with the clock from the context.
      Verify: each function has a test over fixed answers and a fixed clock.
- [x] 2.3 Write the list, text and logic functions of SurveyJS's registry, each in its own module.
      Verify: each function has a test over fixed answers, and the README lists every implemented function.

## 3. Oracle

- [x] 3.1 Record SurveyJS's answers for a table of expressions and answer records at a fixed clock with a throwaway script, and replay them as the package's test.
      Verify: the package returns SurveyJS's value for every fixture, and the script is not committed.
