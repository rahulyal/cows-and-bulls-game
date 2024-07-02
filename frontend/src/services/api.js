import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

//////////////////////////////////////////////////////////////////////////////
// automatcally includes the toke in all API requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

////////////////////////////////////////////////////////////////////////////
//////// Auth related calls

export const login = async (username, password) => {
  const response = await api.post('/api/auth/login', { username, password });
  return response.data;
};

export const register = async (username, password) => {
  const response = await api.post('/api/auth/register', { username, password });
  return response.data;
};

////////////////////////////////////////////////////////////////////////////
/////// Test API calls

export const getUserDetails = async () => {
  const response = await api.get('/api/user/details');
  return response.data;
};

export const getTotalUsers = async () => {
  const response = await api.get('/api/user/count');
  return response.data;
};

////////////////////////////////////////////////////////////////////////////
//////// Public Game related calls

// Non-logged-in user game calls
export const startNewGamePublic = async () => {
  const response = await api.get('/api/game/new');
  return response.data;
};

export const makeGuessPublic = async (gameId, secretNumber, guess) => {
  const response = await api.post('/api/game/guess', { gameId, secretNumber, guess });
  return response.data;
};

////////////////////////////////////////////////////////////////////////////
//////// SinglePlayer signed in game related calls

// Logged-in user game calls
export const getActiveGameUser = async () => {
  const response = await api.get('/api/user/game/active');
  return response.data;
};

export const startNewGameUser = async () => {
  const response = await api.post('/api/user/game/new');
  return response.data;
};

export const makeGuessUser = async (gameId, guess) => {
  const response = await api.post('/api/user/game/guess', { gameId, guess });
  return response.data;
};

export const getGameStateUser = async (gameId) => {
  const response = await api.get(`/api/user/game/${gameId}`);
  return response.data;
};

export const getUserStats = async () => {
  const response = await api.get('/api/user/game/stats');
  return response.data;
};

////////////////////////////////////////////////////////////////////////////
//////// Stats related calls

// Stats related calls
export const updateStats = async (isWon, moves) => {
  const response = await api.post('/api/stats/update', { isWon, moves });
  return response.data;
};

export const getGlobalStats = async () => {
  const response = await api.get('/api/stats/global');
  return response.data;
};

////////////////////////////////////////////////////////////////////////////
//////// Multiplayer Game Management related calls

export const getActiveGames = async () => {
  const response = await api.get('/api/mult/game/active-games');
  return response.data;
};

export const createGame = async () => {
  const response = await api.post('/api/mult/game/create');
  return response.data;
};

export const joinGame = async (inviteCode) => {
  const response = await api.post('/api/mult/game/join', { inviteCode });
  return response.data;
};

export const getStats = async () => {
  const response = await api.get('/api/mult/game/stats');
  return response.data;
};

export const abandonGame = async (gameId) => {
  const response = await api.post('/api/mult/game/abandon', { gameId });
  return response.data;
};


////////////////////////////////////////////////////////////////////////////
//////// Multiplayer GamePlay related calls
export const getGameDetails = async (gameId) => {
  const response = await api.get(`/api/mult/gameplay/${gameId}`);
  return response.data;
};

export const makeGuess = async (gameId, guess) => {
  const response = await api.post(`/api/mult/gameplay/${gameId}/guess`, { guess });
  return response.data;
};

export const setSecretNumber = async (gameId, secretNumber) => {
  const response = await api.post(`/api/mult/gameplay/${gameId}/set-secret`, { secretNumber });
  return response.data;
};

// Add other API calls here

export default api;