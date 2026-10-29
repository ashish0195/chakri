// Small line icons for the controls. They take the text colour.
const svg = (body) =>
  `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

export const ICON = {
  home: svg('<path d="M3.5 11.5 12 4.5l8.5 7"/><path d="M6 10v9.5h12V10"/>'),
  soundOn: svg('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" stroke="none"/><path d="M15.5 9a4 4 0 0 1 0 6"/><path d="M18 6.5a7.5 7.5 0 0 1 0 11"/>'),
  soundOff: svg('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" stroke="none"/><path d="m16 9.5 5 5m0-5-5 5"/>'),
  share: svg('<path d="M12 15V4m0 0L8 8m4-4 4 4"/><path d="M5 12v7.5h14V12"/>'),
  chat: svg('<path d="M4.5 19.5 6 15.5A7.5 7.5 0 1 1 9 18.5z"/>'),
};
