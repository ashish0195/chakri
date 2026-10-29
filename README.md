# Chakri

**The Diwali party game.** A free web game from 9io for Diwali night: one phone, no sign-up, nothing
you type leaves the phone. English first, with desi flavor, and a Hinglish switch. Live at
[chakri.9io.ai](https://chakri.9io.ai).

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
| `press/` | The press kit: fact sheet, descriptions, full-size screenshots and a zip of them. |
| `robots.txt`, `sitemap.xml`, `llms.txt` | For search engines and AI assistants. The key-named `.txt` is IndexNow's proof that we own the site. |

Hinglish lines are written gender-neutral: no verb forms that change with a player's gender. The
tests check for the common ones.

Under the home screen, `index.html` has a plain-HTML section on how both games work, with a FAQ,
for people who scroll and for search engines. The same answers are in its JSON-LD, so change both
together. `app.js` puts the current screen on `body`, and the section hides during a game.

The PostHog block at the end of `index.html`'s head counts visits in cookieless mode: no cookies
or browser storage, and page views only. Autocapture is off, so no button text, names or answers
are sent; keep it off.

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

`og.jpg` (the 1200 × 630 link preview WhatsApp shows) and `apple-touch-icon.png` are drawn from the
game's own art by `tools/og.html` and `tools/touch-icon.html`; `tools/make-images.sh` renders them
with headless Chrome while the server runs. The preview is a JPEG because WhatsApp drops previews
whose image is over about 300 KB.

## Deploy

```sh
tools/deploy.sh
```

It runs the tests, copies the page, `src/` and the images to `/var/www/chakri` on the 9io web server
(the server and ssh key come from `CHAKRI_HOST` and `CHAKRI_KEY`, set in the environment or in
`tools/deploy.env`, which git ignores), and checks that https://chakri.9io.ai answers. The Nginx site is
`sites/_deploy/chakri.9io.ai.conf` in the stocks-bot repo; Certbot added HTTPS on the server and
renews it. HTML, JavaScript and CSS are served with `Cache-Control: no-cache`, so phones pick up a
deploy on their next load.

## Tests

```sh
npm test
```

They check every question and card (both languages, placeholders, lengths, no fire or drink in the
dares, no gendered Hinglish verbs), the rules of both modes, and that every UI string exists in both
languages.

## Still to do

- Have two or three people who celebrate Diwali read the decks, one in the US and one in India.
