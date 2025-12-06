const express = require('express');
const path = require('path');
const morgan = require('morgan');
const {
  WORD_LENGTH,
  evaluateGuess,
  isWinningResult,
  getRandomSecretWord
} = require('./wordgame');

const app = express();
const PORT = process.env.PORT || 3000;

// Titkos szó:
// - ha van SECRET_WORD env -> azt használjuk (debug/teszt)
// - különben random választás a szólistából
let secretWord = process.env.SECRET_WORD
  ? process.env.SECRET_WORD.toUpperCase()
  : getRandomSecretWord();

// ellenőrzés, hogy 5 betűs
if (secretWord.length !== WORD_LENGTH) {
  throw new Error(`SECRET_WORD must be exactly ${WORD_LENGTH} characters long.`);
}

console.log(`(Debug) Secret word at startup: ${secretWord}`);

// EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Egyszerű in-memory állapot
const MAX_ATTEMPTS = 6;
let attempts = []; // { guess, result, winning }
let gameOver = false;
let lastMessage = null;

function resetGame() {
  attempts = [];
  gameOver = false;
  lastMessage = null;

  // Ha nincs fix SECRET_WORD env, akkor újrasorsoljuk minden új játékhoz
  if (!process.env.SECRET_WORD) {
    secretWord = getRandomSecretWord();
    console.log(`(Debug) New secret word: ${secretWord}`);
  }
}

// Főoldal
app.get('/', (req, res) => {
  res.render('index', {
    wordLength: WORD_LENGTH,
    maxAttempts: MAX_ATTEMPTS,
    attempts,
    gameOver,
    lastMessage
  });
});

// Tipp beküldése
app.post('/guess', (req, res) => {
  const rawGuess = (req.body.guess || '').trim().toUpperCase();
  lastMessage = null;

  if (gameOver) {
    lastMessage = 'A játék véget ért. Kattints az "Új játék" gombra a kezdéshez.';
    return res.redirect('/');
  }

  // Csak betűk + pontosan WORD_LENGTH hossz
  if (!/^[A-ZÁÉÍÓÖŐÚÜŰ]+$/i.test(rawGuess) || rawGuess.length !== WORD_LENGTH) {
    lastMessage = `A tipp pontosan ${WORD_LENGTH} betűből álljon (csak betűk).`;
    return res.redirect('/');
  }

  try {
    const result = evaluateGuess(secretWord, rawGuess);
    const winning = isWinningResult(result);

    attempts.push({ guess: rawGuess, result, winning });

    if (winning) {
      gameOver = true;
      lastMessage = '🎉 Gratulálok, eltaláltad a szót!';
    } else if (attempts.length >= MAX_ATTEMPTS) {
      gameOver = true;
      lastMessage = `😢 Elfogytak a próbálkozások. A szó: ${secretWord}.`;
    }
  } catch (err) {
    console.error(err);
    lastMessage = 'Hiba történt a tipp feldolgozása közben.';
  }

  return res.redirect('/');
});

// Játék reset
app.post('/reset', (req, res) => {
  resetGame();
  return res.redirect('/');
});

// Teszthez export, amúgy listenel
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Word guessing game listening on port ${PORT}`);
  });
} else {
  module.exports = app;
}
