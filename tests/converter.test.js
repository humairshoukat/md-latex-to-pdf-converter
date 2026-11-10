import test from 'node:test';
import assert from 'node:assert/strict';
import { renderDocument } from '../static/converter.js';

test('renders Markdown headings and LaTeX fractions', () => {
  const result = renderDocument('# Paper\n\nSolve $\\frac{1}{2}$.');
  assert.match(result.html, /<h1>Paper<\/h1>/);
  assert.match(result.html, /<mfrac>/);
  assert.equal(result.equationCount, 1);
});

test('renders bracket delimiters and numbered display equations', () => {
  const result = renderDocument('1. Solve \\(x^2\\).\n\n   $$\n   \\sqrt{4} = 2\n   $$');
  assert.match(result.html, /<ol>/);
  assert.match(result.html, /<msqrt>/);
  assert.equal(result.equationCount, 2);
});

test('accepts an enclosing Markdown fence', () => {
  assert.equal(renderDocument('```markdown\n# Paper\n```').html, '<h1>Paper</h1>\n');
});

test('preserves mathematical alphabet styles in Unicode', () => {
  assert.match(renderDocument('$\\mathbb{R}$').html, /ℝ/);
});

test('escapes HTML and removes link destinations', () => {
  const result = renderDocument('<script>alert(1)</script>\n\n[Label](https://example.com)');
  assert.doesNotMatch(result.html, /<script|href=/);
  assert.match(result.html, /&lt;script&gt;/);
});

test('rejects empty, oversized and unclosed input', () => {
  assert.throws(() => renderDocument(''), /Paste/);
  assert.throws(() => renderDocument('a'.repeat(100001)), /100,000/);
  assert.throws(() => renderDocument('$x'), /close the maths/);
});

test('rejects unsupported images, embedded code and invalid commands', () => {
  assert.throws(() => renderDocument('![image](x.png)'), /Images/);
  assert.throws(() => renderDocument('Text\n\n```js\nx\n```'), /Embedded code/);
  assert.throws(() => renderDocument('$\\unknowncommand{x}$'), /Equation 1/);
});
