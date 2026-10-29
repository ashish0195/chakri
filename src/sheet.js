// Sheets over the game: the "leave this game?" question and the share sheet.
import { html, markup, raw } from './html.js';
import { t } from './i18n.js';
import { ICON } from './icons.js';

let active = null;

export function isSheetOpen() {
  return active !== null;
}

export function closeSheet() {
  active?.close();
}

function open(content, { onClose } = {}) {
  closeSheet();
  const host = document.getElementById('modal-root');
  const before = document.activeElement;
  host.innerHTML = markup(html`<div class="backdrop">
    <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">${content}</div>
  </div>`);
  const backdrop = host.firstElementChild;

  const onKey = (e) => {
    if (e.key === 'Escape') handle.close();
  };
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) handle.close();
  });
  document.addEventListener('keydown', onKey);
  document.body.classList.add('has-sheet');

  const handle = {
    el: backdrop,
    close() {
      if (active !== handle) return;
      active = null;
      document.removeEventListener('keydown', onKey);
      host.innerHTML = '';
      document.body.classList.remove('has-sheet');
      onClose?.();
      if (before?.isConnected) before.focus({ preventScroll: true });
    },
  };
  active = handle;
  requestAnimationFrame(() => backdrop.querySelector('button, a')?.focus({ preventScroll: true }));
  return handle;
}

export function openConfirm({ title, body, yes, no, onYes }) {
  const sheet = open(html`
    <h2 id="sheet-title" class="sheet-title">${title}</h2>
    <p class="sheet-body">${body}</p>
    <div class="sheet-row">
      <button class="btn btn-ghost" data-sheet="no">${no}</button>
      <button class="btn btn-primary" data-sheet="yes">${yes}</button>
    </div>`);
  sheet.el.querySelector('[data-sheet="no"]').addEventListener('click', () => sheet.close());
  sheet.el.querySelector('[data-sheet="yes"]').addEventListener('click', () => {
    sheet.close();
    onYes();
  });
}

/**
 * Draws a result card and offers every way to post it: the phone's share sheet (with the image when
 * the browser can share files), WhatsApp, saving the image, and copying the text.
 */
export function openShare({ makeCard, text, filename }) {
  let url = null;
  const sheet = open(html`
    <h2 id="sheet-title" class="sheet-title">${t('share.title')}</h2>
    <div class="sheet-preview" aria-busy="true"><div class="spinner" aria-hidden="true"></div><p class="sheet-hint">${t('share.making')}</p></div>
    <div class="sheet-actions"></div>
    <button class="btn btn-ghost btn-wide" data-sheet="close">${t('share.close')}</button>`, {
    onClose: () => {
      if (url) URL.revokeObjectURL(url);
    },
  });
  const { el } = sheet;
  el.querySelector('[data-sheet="close"]').addEventListener('click', () => sheet.close());
  const preview = el.querySelector('.sheet-preview');
  const actions = el.querySelector('.sheet-actions');
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(text)}`;

  const wireCopy = () => {
    const button = actions.querySelector('[data-sheet="copy"]');
    button?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(text);
        button.textContent = t('share.copied');
      } catch {
        // Some browsers don't allow the clipboard; the other buttons still work.
      }
    });
  };

  makeCard().then((blob) => {
    if (active !== sheet) return;
    url = URL.createObjectURL(blob);
    const file = new File([blob], filename, { type: 'image/png' });
    const canShareFile = Boolean(navigator.canShare?.({ files: [file] }));
    preview.removeAttribute('aria-busy');
    preview.innerHTML = markup(html`<img src="${url}" alt="${t('share.alt')}"><p class="sheet-hint">${t('share.hint')}</p>`);
    actions.innerHTML = markup(html`
      ${canShareFile || navigator.share ? html`<button class="btn btn-primary btn-wide" data-sheet="share">${raw(ICON.share)} ${t('share.share')}</button>` : ''}
      <a class="btn btn-whatsapp btn-wide" href="${whatsapp}" target="_blank" rel="noopener">${raw(ICON.chat)} ${t('share.whatsapp')}</a>
      <div class="sheet-row">
        <a class="btn btn-ghost" href="${url}" download="${filename}">${t('share.save')}</a>
        <button class="btn btn-ghost" data-sheet="copy">${t('share.copy')}</button>
      </div>`);
    actions.querySelector('[data-sheet="share"]')?.addEventListener('click', async () => {
      try {
        await navigator.share(canShareFile ? { files: [file], text } : { text });
      } catch {
        // Cancelled, or the share target refused; nothing to do.
      }
    });
    wireCopy();
  }).catch(() => {
    if (active !== sheet) return;
    preview.removeAttribute('aria-busy');
    preview.innerHTML = '';
    actions.innerHTML = markup(html`
      <a class="btn btn-whatsapp btn-wide" href="${whatsapp}" target="_blank" rel="noopener">${raw(ICON.chat)} ${t('share.whatsapp')}</a>
      <button class="btn btn-ghost btn-wide" data-sheet="copy">${t('share.copy')}</button>`);
    wireCopy();
  });
}
