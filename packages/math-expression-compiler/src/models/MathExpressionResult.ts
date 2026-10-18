// An evaluator yields null where mathjs would throw, which is an error that the whole formula takes.
// It yields NaN where mathjs yields NaN as a value, which a comparison or a condition reads as mathjs does.
// The public function makes an error NaN
export type MathExpressionResult = null | number;
