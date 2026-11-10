import { renderDocument } from './converter.js';

const $ = (id) => document.getElementById(id);
const source = $('source');
const preview = $('preview');
let timer;
let copyTimer;
let valid = false;

function invalidate() {
  valid = false;
  $('pdf').disabled = true;
  document.body.classList.remove('has-preview');
  preview.hidden = true;
  preview.replaceChildren();
  $('preview-empty').hidden = false;
  $('error').hidden = true;
}
function render() {
  try {
    const result = renderDocument(source.value);
    preview.innerHTML = result.html;
    preview.hidden = false;
    $('preview-empty').hidden = true;
    $('status').textContent = 'Ready. Review your paper, then save as PDF.';
    document.body.classList.add('has-preview');
    $('pdf').disabled = false;
    valid = true;
  } catch (error) {
    $('preview-empty').textContent = 'Fix the notation to see the preview.';
    $('error').textContent = error.message;
    $('error').hidden = false;
    $('status').textContent = 'Please check the message below.';
  }
}
source.addEventListener('input', () => {
  clearTimeout(timer);
  invalidate();
  const hasText = Boolean(source.value.trim());
  $('preview-empty').textContent = hasText ? 'Updating preview…' : 'Your preview will appear here.';
  $('status').textContent = hasText ? 'Rendering in your browser…' : 'Paste text to begin.';
  if (hasText) timer = setTimeout(render, 250);
});
$('pdf').addEventListener('click', () => {
  if (valid) window.print();
});
$('copy-prompt').addEventListener('click', async () => {
  clearTimeout(copyTimer);
  const prompt = $('prompt-text');
  try {
    await navigator.clipboard.writeText(prompt.value);
    $('copy-prompt').textContent = 'Copied';
  } catch {
    prompt.focus();
    prompt.select();
    $('copy-status').textContent = 'Prompt selected. Press Ctrl+C or Command+C to copy it.';
  }
  copyTimer = setTimeout(() => {
    $('copy-prompt').textContent = 'Copy prompt';
    $('copy-status').textContent = '';
  }, 4000);
});
