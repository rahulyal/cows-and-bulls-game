const db = require('./config/db');

const MAX_GUESSES = 10;

const socketManager = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('joinGame', async ({ gameId, inviteCode }) => {
      console.log(`Client joining game: ${gameId} with invite code: ${inviteCode}`);
      try {
        const gameDetails = await getGameState(gameId);
        socket.join(gameId);
        io.to(gameId).emit('gameUpdated', gameDetails);
      } catch (error) {
        console.error('Error joining game:', error);
        socket.emit('error', { message: 'Failed to join game' });
      }
    });

    socket.on('setSecret', async ({ gameId, userId, secret }) => {
      console.log(`Setting secret for game: ${gameId}, user: ${userId}`);
      try {
        await setSecret(gameId, userId, secret);
        const gameDetails = await getGameState(gameId);
        io.to(gameId).emit('gameUpdated', gameDetails);
      } catch (error) {
        console.error('Error setting secret:', error);
        socket.emit('error', { message: 'Failed to set secret' });
      }
    });

    socket.on('makeGuess', async ({ gameId, userId, guess }) => {
      try {
        const gameState = await getGameState(gameId);
        if (gameState.currentTurn !== userId) {
          throw new Error("It's not your turn");
        }

        const { opponentSecret, playerMoves, opponentMoves } = await getGameInfo(gameId, userId);
        const { bulls, cows } = calculateBullsAndCows(guess, opponentSecret);
        
        await makeGuess(gameId, userId, guess, cows, bulls);
        
        const updatedPlayerMoves = playerMoves + 1;
        const isLastMove = updatedPlayerMoves === MAX_GUESSES;

        if (bulls === 4) {
            if (updatedPlayerMoves > opponentMoves) {
                // Opponent gets one more move for fairness
                await switchTurn(gameId);
                const updatedGameState = await getGameState(gameId);
                updatedGameState.pendingTie = true;  // Flag to indicate potential tie
                io.to(gameId).emit('gameUpdated', updatedGameState);
            } else if (updatedPlayerMoves === opponentMoves) {
                // Both players have had equal moves and this player guessed correctly
                if (gameState.pendingTie) {
                // If there was a pending tie, it's now a confirmed tie
                await endGame(gameId, null, 'tie');
                } else {
                // This player wins
                await endGame(gameId, userId, 'win');
                }
                const finalGameState = await getGameState(gameId);
                io.to(gameId).emit('gameUpdated', finalGameState);
            }
        } else if (gameState.pendingTie) {
                // The other player guessed correctly last turn, but this player didn't
                // End the game with the other player as the winner
                const winnerId = gameState.player1.id === userId ? gameState.player2.id : gameState.player1.id;
                await endGame(gameId, winnerId, 'win');
                const finalGameState = await getGameState(gameId);
                io.to(gameId).emit('gameUpdated', finalGameState);
        } else if (updatedPlayerMoves === MAX_GUESSES && updatedPlayerMoves === opponentMoves) {
            // Both players have made max moves without guessing correctly
            await endGame(gameId, null, 'tie');
            const finalGameState = await getGameState(gameId);
            io.to(gameId).emit('gameUpdated', finalGameState);
        } else {
            // Normal turn switch
            await switchTurn(gameId);
            const updatedGameState = await getGameState(gameId);
            io.to(gameId).emit('gameUpdated', updatedGameState);
        }

      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
};

const setSecret = async (gameId, userId, secret) => {
  await db.query(
    `UPDATE MultiPlayerGames
     SET player1_secret = CASE WHEN player1_id = $1 THEN $2 ELSE player1_secret END,
         player2_secret = CASE WHEN player2_id = $1 THEN $2 ELSE player2_secret END
     WHERE game_id = $3`,
    [userId, secret, gameId]
  );

  const gameDetails = await getGameState(gameId);
  if (gameDetails.player1.secretSet && gameDetails.player2.secretSet) {
    await db.query('UPDATE Games SET status = $1 WHERE game_id = $2', ['active', gameId]);
    await db.query(
      `UPDATE MultiPlayerGames SET current_turn = 
      (SELECT player1_id FROM MultiPlayerGames WHERE game_id = $1)
      WHERE game_id = $1`,
      [gameId]
    );
  }
};

const getGameInfo = async (gameId, userId) => {
  const result = await db.query(
    `SELECT 
      CASE 
        WHEN player1_id = $1 THEN player2_secret 
        ELSE player1_secret 
      END as opponent_secret,
      (SELECT COUNT(*) FROM Moves WHERE game_id = $2 AND user_id = $1) as player_moves,
      (SELECT COUNT(*) FROM Moves WHERE game_id = $2 AND user_id != $1) as opponent_moves
    FROM MultiPlayerGames
    WHERE game_id = $2`,
    [userId, gameId]
  );
  return {
    opponentSecret: result.rows[0].opponent_secret,
    playerMoves: parseInt(result.rows[0].player_moves),
    opponentMoves: parseInt(result.rows[0].opponent_moves)
  };
};

const makeGuess = async (gameId, userId, guess, cows, bulls) => {
  const result = await db.query(
    `INSERT INTO Moves (game_id, user_id, move_number, guess, cows, bulls)
     VALUES ($1, $2, 
       (SELECT COALESCE(MAX(move_number), 0) + 1 
        FROM Moves 
        WHERE game_id = $1 AND user_id = $2), 
       $3, $4, $5)
     RETURNING move_number`,
    [gameId, userId, guess, cows, bulls]
  );
  return result.rows[0].move_number;
};

const getGameState = async (gameId) => {
  const gameResult = await db.query(
    `SELECT g.*, m.player1_id, m.player2_id, m.current_turn,
     m.player1_secret, m.player2_secret, m.game_outcome,
     u1.username as player1_name, u2.username as player2_name,
     (SELECT COUNT(*) FROM Moves WHERE game_id = g.game_id AND user_id = m.player1_id) as player1_moves,
     (SELECT COUNT(*) FROM Moves WHERE game_id = g.game_id AND user_id = m.player2_id) as player2_moves
     FROM Games g
     JOIN MultiPlayerGames m ON g.game_id = m.game_id
     LEFT JOIN Users u1 ON m.player1_id = u1.user_id
     LEFT JOIN Users u2 ON m.player2_id = u2.user_id
     WHERE g.game_id = $1`,
    [gameId]
  );

  const movesResult = await db.query(
    `SELECT user_id, move_number, guess, cows, bulls
     FROM Moves
     WHERE game_id = $1
     ORDER BY move_number ASC`,
    [gameId]
  );

  const game = gameResult.rows[0];
  const moves = movesResult.rows;

  return {
    gameId: game.game_id,
    status: game.status,
    player1: {
      id: game.player1_id,
      name: game.player1_name,
      secretSet: !!game.player1_secret,
      moves: moves.filter(move => move.user_id === game.player1_id)
    },
    player2: {
      id: game.player2_id,
      name: game.player2_name,
      secretSet: !!game.player2_secret,
      moves: moves.filter(move => move.user_id === game.player2_id)
    },
    currentTurn: game.current_turn,
    winner: game.winner_id,
    gameOutcome: game.game_outcome,
    pendingTie: game.player1_moves !== game.player2_moves && 
                (moves.some(m => m.bulls === 4) || 
                 Math.max(game.player1_moves, game.player2_moves) === MAX_GUESSES)
  };
};

const switchTurn = async (gameId) => {
  await db.query(
    `UPDATE MultiPlayerGames 
     SET current_turn = CASE 
       WHEN current_turn = player1_id THEN player2_id 
       ELSE player1_id 
     END
     WHERE game_id = $1`,
    [gameId]
  );
};

const endGame = async (gameId, winnerId, result) => {
  if (result === 'tie') {
    await db.query(
      `UPDATE Games SET status = 'completed' WHERE game_id = $1`,
      [gameId]
    );
    await db.query(
        `UPDATE MultiPlayerGames SET game_outcome = 'tie' WHERE game_id = $1`,
        [gameId]
    );
  } else {
    await db.query(
      `UPDATE Games SET status = 'completed', winner_id = $1 WHERE game_id = $2`,
      [winnerId, gameId]
    );
    await db.query(
      `UPDATE MultiPlayerGames 
       SET game_outcome = CASE 
         WHEN player1_id = $1 THEN 'player1_win'
         WHEN player2_id = $1 THEN 'player2_win'
       END
       WHERE game_id = $2`,
       [winnerId, gameId]
    );
  }
};

const calculateBullsAndCows = (guess, secret) => {
  let bulls = 0;
  let cows = 0;
  const secretArray = secret.split('');
  const guessArray = guess.split('');

  for (let i = 0; i < 4; i++) {
    if (guessArray[i] === secretArray[i]) {
      bulls++;
    } else if (secretArray.includes(guessArray[i])) {
      cows++;
    }
  }

  return { bulls, cows };
};

module.exports = socketManager;