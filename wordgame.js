const WORD_LENGTH = 5;

// Csak 5 betűs szavak legyenek, nagybetűvel.
const WORD_LIST = [
  'ALATT', 'LABDA',
  'KUTYA', 'FALAT',
  'SAROK', 'VIRÁG',
  'TOROK', 'KÉPES',
  'HIDAK', 'MALOM',
  'HAVAS', 'HORDÓ',
  'LAPÁT', 'KALAP',
  'POHÁR', 'TANÁR',
  'CIPŐK', 'SZEME',
  'FEHÉR', 'FÉKET',
  'TALAJ', 'HOLLÓ',
  'FENYŐ', 'LEVÉL',
  'EGERI', 'SÜKET',
  'ASZAL', 'FUTÁS',
  'KÖVEK', 'KAPUS',
  'CSIGA', 'MADÁR',
  'ÁLMOS', 'TÜKÖR',
  'PAPÍR', 'TÁBOR',
  'VÁROS', 'FÉLÉV',
  'KÖNYV', 'TÖLTŐ',
  'KICSI', 'PLUSZ',
  'HÁZAK', 'KERTI',
  'TORTA', 'JÁRAT',
  'PORTA', 'FÜRDŐ',
  'PÁRNA', 'PLÜSS',
  'KÉTES', 'RÉTES',
  'KÉKES', 'NEKED'
];

/**
 * Véletlenszerű titkos szó választása a WORD_LIST-ből.
 */
function getRandomSecretWord() {
  const index = Math.floor(Math.random() * WORD_LIST.length);
  return WORD_LIST[index];
}

/**
 * Wordle-szerű értékelés:
 *  - 'correct' = jó betű, jó helyen (zöld)
 *  - 'present' = jó betű, rossz helyen (sárga)
 *  - 'absent'  = nincs ilyen betű a szóban (szürke/piros)
 *
 * Duplikált betűket is kezeli.
 */
function evaluateGuess(secret, guess) {
  if (secret.length !== WORD_LENGTH || guess.length !== WORD_LENGTH) {
    throw new Error('Secret and guess must be 5 characters long.');
  }

  const s = secret.toUpperCase();
  const g = guess.toUpperCase();

  const result = [];
  const secretCounts = {};

  // Titkos szó betűinek számlálása
  for (let i = 0; i < WORD_LENGTH; i++) {
    const ch = s[i];
    secretCounts[ch] = (secretCounts[ch] || 0) + 1;
  }

  // Első kör: correct (zöld)
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (g[i] === s[i]) {
      result[i] = { letter: g[i], status: 'correct' };
      secretCounts[g[i]] -= 1;
    } else {
      result[i] = { letter: g[i], status: 'unknown' }; // majd sárga/szürke
    }
  }

  // Második kör: present / absent (sárga / szürke)
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i].status === 'unknown') {
      const ch = g[i];
      if (secretCounts[ch] > 0) {
        result[i].status = 'present';
        secretCounts[ch] -= 1;
      } else {
        result[i].status = 'absent';
      }
    }
  }

  return result;
}

/**
 * Igaz, ha az értékelésben minden betű 'correct'.
 */
function isWinningResult(result) {
  return result.every(cell => cell.status === 'correct');
}

module.exports = {
  WORD_LENGTH,
  WORD_LIST,
  getRandomSecretWord,
  evaluateGuess,
  isWinningResult
};
