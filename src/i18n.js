// The game's own words, in English and Hinglish. Questions and cards carry their own { en, hi }.
// Hinglish lines stay gender-neutral: no verb forms that change with the player's gender.
import { load, save } from './store.js';

export const STRINGS = {
  tagline: ['The Diwali party game', 'Diwali party ka game'],

  'home.jodi.title': ['Jodi Check', 'Jodi Check'],
  'home.jodi.sub': ['How well do you really know each other?', 'Ek doosre ko kitna jaante ho? Sach mein?'],
  'home.jodi.meta': ['2 players · 12 questions · one phone', '2 players · 12 sawaal · ek phone'],
  'home.tod.title': ['Chakri Truth or Dare', 'Chakri Truth or Dare'],
  'home.tod.sub': ['Spin the chakri. Pick your patakha. No backing out.', 'Chakri ghumao. Patakha chuno. Peeche hatna mana hai.'],
  'home.tod.meta': ['2–12 players · phone in the middle', '2–12 players · phone beech mein'],
  'home.privacy': ['No sign-up. Nothing you type leaves your phone.', 'No sign-up. Tumhara likha kuch bhi phone se bahar nahi jaata.'],
  'home.from': ['A Diwali party game from 9io', '9io ka Diwali party game'],
  'home.spin': ['Spin the chakri', 'Chakri ghumao'],
  'tod.play.title': ['Chakri Truth or Dare', 'Chakri Truth or Dare'],

  'top.home': ['Home', 'Home'],
  'top.sound.on': ['Sound is on', 'Sound on hai'],
  'top.sound.off': ['Sound is off', 'Sound off hai'],
  'top.lang': ['Language', 'Bhasha'],

  'leave.title': ['Leave this game?', 'Game chhodna hai?'],
  'leave.body': ["This game's score will be lost.", 'Is game ka score chala jayega.'],
  'leave.yes': ['Leave', 'Haan, chhodo'],
  'leave.no': ['Keep playing', 'Nahi, khelte hain'],

  'jodi.setup.title': ["Who's the jodi?", 'Aaj ki jodi kaun?'],
  'jodi.setup.type': ['What kind of jodi?', 'Kaisi jodi hai?'],
  'jodi.type.couple': ['Couple', 'Couple'],
  'jodi.type.couple.sub': ['Partners, newlyweds, the newly engaged', 'Partners, newly married, naye-naye engaged'],
  'jodi.type.siblings': ['Siblings', 'Bhai-Behen'],
  'jodi.type.siblings.sub': ['Bhai Dooj ready', 'Bhai Dooj ready'],
  'jodi.type.friends': ['Best friends', 'Best friends'],
  'jodi.type.friends.sub': ['Friends since forever', 'Bachpan ke yaar'],
  'jodi.type.family': ['Family', 'Family'],
  'jodi.type.family.sub': ['Parent & kid, in-laws, cousins', 'Mummy-Papa, saas-bahu, cousins'],
  'jodi.setup.names': ['Your names', 'Tumhare naam'],
  'jodi.setup.name1': ['First player', 'Pehla player'],
  'jodi.setup.name2': ['Second player', 'Doosra player'],
  'jodi.setup.how': ['How it works', 'Kaise khelein'],
  'jodi.setup.step1': ['One of you answers 6 questions about yourself, in secret.', 'Ek player chupke se apne baare mein 6 sawaalon ke jawab de.'],
  'jodi.setup.step2': ['The other guesses each answer. Every match lights a diya.', 'Doosra har jawab guess kare. Har match pe ek diya jalega.'],
  'jodi.setup.step3': ['Swap and go again. Light all 12 to finish the rangoli.', 'Phir swap. Saare 12 diye jalao, rangoli poori karo.'],
  'jodi.setup.start': ["Let's play", 'Chalo, shuru'],
  'jodi.player1': ['Player 1', 'Player 1'],
  'jodi.player2': ['Player 2', 'Player 2'],

  'jodi.handoff.title': ['Hand the phone to {name}', 'Phone {name} ko do'],
  'jodi.handoff.peek': ['{name}, no peeking. Look away!', '{name}, jhaankna mana hai. Udhar dekho!'],
  'jodi.handoff.go': ["I'm {name}. Start", 'Main {name} hoon. Shuru karo'],
  'jodi.answer.kicker': ['About you · {n} of 6', 'Tumhare baare mein · {n}/6'],
  'jodi.answer.hint': ['Answer honestly. {name} has to guess.', 'Sach-sach batao. Guess {name} ko karna hai.'],
  'jodi.answer.undo': ['Change my last answer', 'Pichla jawab badlo'],
  'jodi.pass.title': ['Done! Now hand the phone to {name}.', 'Ho gaya! Ab phone {name} ko do.'],
  'jodi.pass.watch': ['{name}, you can watch now 👀', '{name}, ab dekhna allowed hai 👀'],
  'jodi.pass.go': ["I'm {name}. Let's guess", 'Main {name} hoon. Guess shuru'],
  'jodi.guess.kicker': ['{name} guesses · {n} of 6', 'Guess: {name} · {n}/6'],
  'jodi.guess.hint': ['What did {name} pick?', '{name} ne kya chuna?'],
  'jodi.reveal.match': ['Match! A diya is lit 🪔', 'Match! Ek diya jal gaya 🪔'],
  'jodi.reveal.miss': ['{name} actually said:', '{name} ka asli jawab:'],
  'jodi.reveal.nope': ['So close. No diya this time.', 'Arre! Is baar diya nahi jala.'],
  'jodi.reveal.theirs': ["{name}'s answer", '{name} ka jawab'],
  'jodi.reveal.guess': ["{name}'s guess", '{name} ka guess'],
  'jodi.next': ['Next', 'Agla'],
  'jodi.continue': ['Continue', 'Aage'],
  'jodi.half.title': ['Halfway there!', 'Aadha ho gaya!'],
  'jodi.half.score': ['{guesser} got {n} of 6 about {subject}.', '{subject} ke baare mein {guesser}: {n}/6 sahi.'],
  'jodi.half.next': ['Now swap: {subject} answers, {guesser} guesses.', 'Ab swap: jawab {subject} ke, guess {guesser} ka.'],
  'jodi.half.go': ['Swap', 'Swap karo'],
  'jodi.result.kicker': ['Jodi score', 'Jodi score'],
  'jodi.result.knows': ['{guesser} knows {subject}', '{subject} ke baare mein {guesser}'],
  'jodi.result.brag': ['{name} wins bragging rights 🏆', 'Bragging rights: {name} 🏆'],
  'jodi.result.tie': ['Dead even. Bragging rights are shared.', 'Barabar! Bragging rights aadhe-aadhe.'],
  'jodi.result.share': ['Share your score', 'Score share karo'],
  'jodi.result.again': ['Play again', 'Phir se khelo'],
  'jodi.result.new': ['New jodi', 'Nayi jodi'],

  'tod.setup.title': ["Who's at the table?", 'Table pe kaun-kaun hai?'],
  'tod.setup.add': ['Add', 'Add'],
  'tod.setup.placeholder': ['Add a name', 'Naam likho'],
  'tod.setup.players': ['{n} players', '{n} players'],
  'tod.setup.need': ['Add at least 2 players.', 'Kam se kam 2 players chahiye.'],
  'tod.setup.full': ["That's a full table: 12 players at most.", 'Table full: maximum 12 players.'],
  'tod.setup.remove': ['Remove {name}', '{name} ko hatao'],
  'tod.setup.decks': ['Pick your decks', 'Decks chuno'],
  'deck.family': ['Family', 'Family'],
  'deck.family.sub': ['Safe in front of Dadi', 'Dadi ke saamne bhi safe'],
  'deck.friends': ['Friends', 'Dost'],
  'deck.friends.sub': ['No mercy', 'Koi raham nahi'],
  'deck.couple': ['Couple', 'Couple'],
  'deck.couple.sub': ['A little spicy, just the two of you', 'Thoda spicy, sirf tum do'],
  'deck.couple.locked': ['For exactly 2 players', 'Sirf 2 players ke liye'],
  'deck.aunty': ['Aunty Special', 'Aunty Special'],
  'deck.aunty.sub': ['Nosy relatives, live', 'Rishtedaar, live'],
  'tod.setup.laddoos': ['Everyone gets 3 laddoos. Skipping a card costs one.', 'Sabko 3 laddoo milenge. Card skip karne ka ek laddoo.'],
  'tod.setup.start': ['Start spinning', 'Chakri ghumao'],

  'tod.spin.hint': ['Swipe the chakri to spin it', 'Chakri ko swipe karke ghumao'],
  'tod.spin.button': ['Spin', 'Ghumao'],
  'tod.spin.landed': ["{name}, it's you!", '{name}, tumhari baari!'],
  'tod.pick.title': ['Pick your patakha', 'Apna patakha chuno'],
  'level.sparkler': ['Sparkler', 'Phuljhadi'],
  'level.sparkler.sub': ['Easy truth', 'Halka sach'],
  'level.flowerpot': ['Anaar', 'Anaar'],
  'level.flowerpot.sub': ['Juicy truth', 'Teekha sach'],
  'level.rocket': ['Rocket', 'Rocket'],
  'level.rocket.sub': ['Dare', 'Dare'],
  'level.bomb': ['Sutli bomb', 'Sutli bomb'],
  'level.bomb.sub': ['Big dare', 'Bada dare'],
  'tod.points': ['+{n}', '+{n}'],
  'tod.card.truth': ["{name}'s truth", '{name} ka sach'],
  'tod.card.dare': ["{name}'s dare", '{name} ka dare'],
  'tod.card.done': ['Done! +{n}', 'Ho gaya! +{n}'],
  'tod.card.skip': ['Skip · pay a laddoo', 'Skip · ek laddoo do'],
  'tod.card.left': ['{n} left', '{n} bache'],
  'tod.card.broke': ['No laddoos left. You have to do it! 😈', 'Laddoo khatam. Ab toh karna padega! 😈'],
  'tod.end': ['End game', 'Game khatam'],
  'tod.result.kicker': ['Patakha of the night', 'Raat ka Patakha'],
  'tod.result.points': ['{n} points', '{n} points'],
  'tod.result.point': ['1 point', '1 point'],
  'tod.result.standings': ['Scores', 'Score'],
  'tod.result.none': ['Nobody played a card yet.', 'Abhi tak kisi ne card nahi khela.'],
  'award.rocket': ['Rocket of the night', 'Raat ka Rocket'],
  'award.rocket.sub': ['{name} · most dares', '{name} · sabse zyada dares'],
  'award.hoarder': ['Laddoo hoarder', 'Laddoo ka khazanchi'],
  'award.hoarder.sub': ['{name} · never skipped', '{name} · ek bhi skip nahi'],
  'award.lover': ['Laddoo lover', 'Laddoo premi'],
  'award.lover.sub': ['{name} · skipped the most', '{name} · sabse zyada skip'],
  'tod.result.share': ['Share the night', 'Raat share karo'],
  'tod.result.again': ['Play again', 'Phir se khelo'],
  'tod.result.resume': ['Keep playing', 'Aur khelo'],
  'tod.result.new': ['New players', 'Naye players'],

  'share.title': ['Your card', 'Tumhara card'],
  'share.making': ['Making your card…', 'Ek second, card ready ho jayega…'],
  'share.share': ['Share', 'Share karo'],
  'share.save': ['Save image', 'Image save karo'],
  'share.whatsapp': ['Send on WhatsApp', 'WhatsApp pe bhejo'],
  'share.copy': ['Copy text', 'Text copy karo'],
  'share.copied': ['Copied!', 'Copy ho gaya!'],
  'share.close': ['Close', 'Band karo'],
  'share.hint': ['Post it on your story and tag your people.', 'Story pe daalo, apne logon ko tag karo.'],
  'share.alt': ['Your Chakri result card', 'Tumhara Chakri result card'],
  'share.jodi.text': [
    '{a} & {b} scored {score}/12 on Jodi Check: "{title}" 🪔 How well do you know your jodi? {url}',
    '{a} & {b} ka Jodi Check score: {score}/12, "{title}" 🪔 Tumhari jodi ka score kitna? {url}',
  ],
  'share.tod.text': [
    'Diwali night, Chakri Truth or Dare. Patakha of the night: {name} 🎆 Play free: {url}',
    'Diwali night pe Chakri Truth or Dare. Raat ka Patakha: {name} 🎆 Free mein khelo: {url}',
  ],

  'card.jodi.label': ['JODI CHECK', 'JODI CHECK'],
  'card.jodi.cta': ['How well do you know your jodi?', 'Tumhari jodi ka score kitna?'],
  'card.tod.label': ['TRUTH OR DARE', 'TRUTH OR DARE'],
  'card.tod.cta': ['Spin the chakri at your Diwali party', 'Apni Diwali party pe chakri ghumao'],
  'card.play': ['Play free · {host}', 'Free mein khelo · {host}'],
};

export const LANGS = ['en', 'hi'];

let lang = load('lang', 'en') === 'hi' ? 'hi' : 'en';

export function getLang() {
  return lang;
}

export function setLang(next) {
  lang = next === 'hi' ? 'hi' : 'en';
  save('lang', lang);
  applyLang();
}

export function applyLang() {
  document.documentElement.lang = lang === 'hi' ? 'hi-Latn' : 'en';
}

/** Replaces {key} with vars[key]; unknown keys are left as they are. */
export function fill(text, vars = {}) {
  return text.replace(/\{(\w+)\}/g, (match, key) => (key in vars ? String(vars[key]) : match));
}

/** A UI string in the current language. */
export function t(key, vars) {
  const pair = STRINGS[key];
  if (!pair) return key;
  return fill(pair[lang === 'hi' ? 1 : 0], vars);
}

/** A piece of content ({ en, hi }) in the current language. */
export function pick(text, vars) {
  return fill(text[lang] ?? text.en, vars);
}

