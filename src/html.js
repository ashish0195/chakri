// A tiny HTML templating helper. Values are escaped unless they're marked raw, so players' names
// can go anywhere in a template safely.

const RAW = Symbol('raw');

export function raw(markup) {
  return { [RAW]: String(markup) };
}

export function esc(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function render(value) {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.map(render).join('');
  if (typeof value === 'object' && RAW in value) return value[RAW];
  return esc(value);
}

/** Tagged template: html`<p>${name}</p>` escapes `name`; nested html`` and raw() pass through. */
export function html(strings, ...values) {
  let out = strings[0];
  values.forEach((value, i) => {
    out += render(value) + strings[i + 1];
  });
  return raw(out);
}

/** The markup string of an html`` result. */
export function markup(value) {
  return render(value);
}
