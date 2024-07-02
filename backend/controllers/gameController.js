const generateSecretNumber = () => {
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  let secret = '';
  
  // Ensure the first digit is not '0'
  const firstDigitIndex = Math.floor(Math.random() * (digits.length - 1)) + 1;
  secret += digits[firstDigitIndex];
  digits.splice(firstDigitIndex, 1);
  
  // Generate the rest of the digits
  for (let i = 0; i < 3; i++) {
    const index = Math.floor(Math.random() * digits.length);
    secret += digits[index];
    digits.splice(index, 1);
  }
  return secret;
};
  
  const evaluateGuess = (secret, guess) => {
    let bulls = 0;
    let cows = 0;
    for (let i = 0; i < 4; i++) {
      if (secret[i] === guess[i]) {
        bulls++;
      } else if (secret.includes(guess[i])) {
        cows++;
      }
    }
    return { bulls, cows };
};
  
const startNewGame = (req, res) => {
  const secretNumber = generateSecretNumber();
  const gameId = `${Date.now().toString()}-${secretNumber}`;
  res.json({ gameId, secretNumber });
};
  
const makeGuess = (req, res) => {
    const { gameId, secretNumber, guess } = req.body;
    if (!gameId || !secretNumber || !guess) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    const result = evaluateGuess(secretNumber, guess);
    res.json({ ...result, gameId, guess });
};

module.exports = { startNewGame , makeGuess };