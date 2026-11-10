import { MarkdownIt, tex, katex } from './vendor/renderers.js';
import { nativeMathVariants } from './vendor/math-variants.js';

export const MAX_SOURCE = 100_000;

function normalizeSource(input) {
  if (typeof input !== 'string' || !input.trim()) throw new Error('Paste your Markdown + LaTeX first.');
  if (input.length > MAX_SOURCE) throw new Error('Keep each document under 100,000 characters.');
  let source = input.replace(/\r\n?/g, '\n').trim();
  const fence = source.match(/^```(?:markdown|md|text)?\s*\n([\s\S]*)\n```$/i);
  if (fence) source = fence[1].trim();
  if (!source) throw new Error('Paste your Markdown + LaTeX first.');
  return source;
}

function countMath(source) {
  const pairs = { '$': '$', '$$': '$$', '\\(': '\\)', '\\[': '\\]' };
  let opening = null;
  let openedLine = 1;
  let line = 1;
  let count = 0;
  for (let index = 0; index < source.length;) {
    const char = source[index];
    if (char === '\n') line += 1;
    const two = source.slice(index, index + 2);
    const token = ['\\(', '\\)', '\\[', '\\]', '$$'].includes(two) ? two : char === '$' ? '$' : null;
    if (token) {
      if (opening === null) {
        if (!pairs[token]) throw new Error(`Line ${line}: ${token} needs an opening maths delimiter.`);
        opening = token;
        openedLine = line;
      } else if (token === pairs[opening]) {
        count += 1;
        opening = null;
      } else if (['\\)', '\\]'].includes(token) || (token.startsWith('$') && opening.startsWith('$'))) {
        throw new Error(`Line ${line}: use matching maths delimiters. Opened ${opening} on line ${openedLine}.`);
      }
      index += token.length;
      continue;
    }
    if (char === '\\') {
      if (opening === null && /^\\[A-Za-z]+/.test(source.slice(index))) {
        throw new Error(`Line ${line}: put LaTeX commands inside $...$ or $$...$$.`);
      }
      index += 2;
    } else {
      index += 1;
    }
  }
  if (opening !== null) throw new Error(`Line ${openedLine}: close the maths expression with ${pairs[opening]}.`);
  return count;
}

const markdown = new MarkdownIt({ html: false, linkify: false, typographer: false }).use(tex, {
  delimiters: 'all',
  allowInlineWithSpace: false,
  render(content, displayMode, env) {
    env.equationCount += 1;
    if (content.length > 10_000) throw new Error('Split very long equations into smaller expressions.');
    try {
      const mathml = katex.renderToString(content, {
        displayMode,
        output: 'mathml',
        throwOnError: true,
        strict: 'error',
        maxExpand: 1000,
        maxSize: 20,
        macros: Object.create(null),
        trust: () => { throw new Error('Links, images and HTML commands are not allowed inside maths.'); },
      });
      // A fence flag alone does not make a native MathML operator stretch.
      // Explicit sizing is needed for KaTeX's U+2223 modulus/determinant bars.
      return nativeMathVariants(mathml).replaceAll('<mo fence="true">', '<mo fence="true" stretchy="true">');
    } catch (error) {
      throw new Error(`Equation ${env.equationCount}: ${error.message}`);
    }
  },
});

markdown.renderer.rules.link_open = markdown.renderer.rules.link_close = () => '';
markdown.renderer.rules.image = () => { throw new Error('Images and diagrams are not supported. Use Markdown text and LaTeX maths.'); };
markdown.renderer.rules.fence = markdown.renderer.rules.code_block = () => {
  throw new Error('Embedded code blocks are not supported. Paste the paper as Markdown with LaTeX maths.');
};

export function renderDocument(input) {
  const source = normalizeSource(input);
  const expected = countMath(source);
  const env = { equationCount: 0 };
  const html = markdown.render(source, env);
  if (env.equationCount !== expected) {
    throw new Error('Some maths was read as text. Remove spaces just inside inline $ delimiters and put display equations on separate lines with blank lines around them.');
  }
  return { html, equationCount: env.equationCount };
}
