const cite = document.querySelector('#cite');
const citation = document.querySelector('#citation');
const copyStatus = document.querySelector('#copy-status');
cite.addEventListener('click', () => {
  citation.hidden = !citation.hidden;
  cite.setAttribute('aria-expanded', String(!citation.hidden));
  copyStatus.textContent = '';
});

document.querySelector('#copy').addEventListener('click', async () => {
  const bibtex = document.querySelector('#bibtex');
  try {
    await navigator.clipboard.writeText(bibtex.textContent);
    copyStatus.textContent = 'Copied to clipboard.';
  } catch {
    const range = document.createRange();
    range.selectNodeContents(bibtex);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    copyStatus.textContent = 'Citation selected. Use your browser to copy it.';
  }
});

const boundaries = document.querySelector('#boundaries');
const note = document.querySelector('#plot-note');
boundaries.addEventListener('change', () => {
  note.textContent = boundaries.checked
    ? 'Markers split the highlighted trace at local peaks in uncertainty.'
    : 'Peaks show where the next token is harder to predict.';
});
