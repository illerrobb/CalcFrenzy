const { generateProblem, evaluateExpression } = require('../script.js');

describe('generateProblem', () => {
  test('returns non-negative results within expected bounds', () => {
    global.level = 5;
    const { expression, result } = generateProblem();
    expect(typeof expression).toBe('string');
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThanOrEqual(0);
    const max = 10 + level * 0.5;
    expect(result).toBeLessThanOrEqual(max);
  });
});

describe('evaluateExpression', () => {
  test('returns correct evaluation for valid expressions', () => {
    expect(evaluateExpression('2+3')).toBe(5);
  });

  test('handles malformed expressions safely', () => {
    expect(evaluateExpression('2++2')).toBeNaN();
    expect(evaluateExpression('abc')).toBeUndefined();
  });
});
