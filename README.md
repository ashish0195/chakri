# Chakri

**The Diwali party game.** A free web game from 9io for Diwali night: one phone, no sign-up, nothing
leaves the phone. English first, with desi flavor, and a Hinglish switch.

## Two ways to play

- **Jodi Check: how well do you really know each other?** Two players (a couple, siblings, best
  friends, or family). One answers 6 questions about themselves in secret, the other guesses each
  answer, then they swap. Every match lights a diya; light all 12 to finish the rangoli. The result
  gets a title, from *Made in the same factory* (12/12) down through *Kaju katli jodi*, *Gulab jamun
  jodi* and *Soan papdi jodi* (passed around for years, never actually opened), and a story-sized card
  to post.
- **Chakri Truth or Dare.** 2 to 12 players, phone in the middle. Swipe the chakri; it spins, sprays
  sparks and stops on someone. They pick a patakha: Sparkler (easy truth, 1 point), Anaar (juicy
  truth, 2), Rocket (dare, 2) or Sutli bomb (big dare, 3). Everyone has 3 laddoos to skip cards with.
  Decks: Family (safe in front of Dadi), Friends, Couple (two players only) and Aunty Special (the
  nosy relatives' questions). At the end: the Patakha of the night, the scores, awards and a card.

## What's inside

Plain HTML, CSS and JavaScript modules, no build step and no dependencies.

| File | What it is |
|---|---|
| `index.html`, `style.css` | The page and its look: Diwali night, string lights, glassy cards. |
| `src/app.js` | Boots the page; the top bar (language, sound), the home screen, routing, the back button. |
| `src/play-jodi.js`, `src/play-tod.js` | The screens of the two modes. |
| `src/jodi.js`, `src/dares.js` | The rules of the two modes, with no DOM, so they're tested on their own. |
| `src/decks/jodi.js`, `src/decks/dares.js` | The questions and the truth-or-dare cards, each in English and Hinglish. |
| `src/i18n.js` | The game's own words in English and Hinglish. |
| `src/art.js` | Diyas, the rangoli, the chakri, the four firecrackers, laddoos and the string lights, as SVG. |
| `src/wheel.js` | The spinning chakri wheel: swipe or tap, sparks, ticks, and a fair landing. |
| `src/fx.js` | Fireworks and sparks on one canvas. |
| `src/sound.js` | Every sound, synthesized with Web Audio; nothing is sampled. |
| `src/card.js`, `src/sheet.js` | The 1080 × 1920 result cards and the share sheet (share, WhatsApp, save, copy). |
| `src/config.js` | The site's address, used on the cards and in the share text. |

Hinglish lines are written gender-neutral: no verb forms that change with a player's gender. The
tests check for the common ones.

## Content rules

The game is about the social side of Diwali (food, sweets, lights, family, nosy relatives, card
nights, the soan papdi box that gets passed from house to house), not the religious side, so everyone
who celebrates the season is in. No dare involves fire, firecrackers, diyas, drink, smoke, going
outside or messaging anyone outside the room. The Couple deck is flirty, never explicit.

## Run it

Browsers don't load modules from `file://`, so serve the folder (`tools/serve.py` turns caching off):

```sh
npm run serve      # then open http://localhost:8642
```

`og.png` (the 1200 × 630 link preview WhatsApp shows) and `apple-touch-icon.png` are drawn from the
game's own art by `tools/og.html` and `tools/touch-icon.html`; `tools/make-images.sh` renders them
with headless Chrome while the server runs.

## Tests

```sh
npm test
```

They check every question and card (both languages, placeholders, lengths, no fire or drink in the
dares, no gendered Hinglish verbs), the rules of both modes, and that every UI string exists in both
languages.

## Before launch

- Set the real domain in `src/config.js` and in the `og:` tags of `index.html` (both say
  `chakri.9io.ai`, which doesn't resolve yet).
- Serve JavaScript and CSS with a short cache (or revalidation) while the game is still changing:
  a phone holding yesterday's `app.js` next to today's decks can break.
- Have two or three people who celebrate Diwali read the decks, one in the US and one in India.
