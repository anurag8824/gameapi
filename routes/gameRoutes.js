const express = require('express');
const {
  fetchGameList,
  createUser,
  openGame,
  addBalance,
  deductBalance,
  getGameList_by_provide,
  getGameList_by_type,
  checkBalance,
  completeTransfer,
} = require('../controllers/gameController');

const router = express.Router();

// Route to fetch the game list
router.post('/games', async (req, res) => {
  const { size } = req.body;
  if (!size || size <= 0) {
    return res.status(400).json({ error: 'Valid size is required' });
  }

  try {
    const data = await fetchGameList(size);
    res.status(200).json({ message: 'Game list fetched successfully', data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch game list', details: error.message });
  }
});

router.get('/checkBalance', async (req, res) => {
  const playerId = req.query.playerId; // Extract playerId from query parameters
  if (!playerId || playerId <= 0) {
    return res.status(400).json({ error: 'Valid playerId is required' });
  }

  try {
    const data = await checkBalance(playerId);
    res.status(200).json({ message: 'Game list fetched successfully', data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch game list', details: error.message });
  }
});

router.get('/completeTransfer', async (req, res) => {
  const playerId = req.query.playerId; // Extract playerId from query parameters
  if (!playerId || playerId <= 0) {
    return res.status(400).json({ error: 'Valid playerId is required' });
  }

  try {
    const data = await completeTransfer(playerId);
    res.status(200).json({ message: 'Game list fetched successfully', data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch game list', details: error.message });
  }
});


// Route to create a user
router.post('/users', async (req, res) => {
  const { playerId } = req.body;
  if (!playerId) {
    return res.status(400).json({ error: 'Player ID is required' });
  }

  try {
    const data = await createUser(playerId);
    res.status(201).json({ message: 'User created successfully', data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user', details: error.message });
  }
});

// Route to fetch games by provider
router.post('/games/provider', async (req, res) => {
  const { size, provider } = req.body;

  if (!size || !provider) {
    return res.status(400).json({ error: 'Size and provider are required' });
  }

  try {
    const data = await getGameList_by_provide(size, provider);
    res.status(200).json({ message: 'Games fetched successfully by provider', data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch games by provider', details: error.message });
  }
});

// Route to fetch games by type
router.post('/games/type', async (req, res) => {
  const { size, type } = req.body;

  if (!size || !type) {
    return res.status(400).json({ error: 'Size and type are required' });
  }

  try {
    const data = await getGameList_by_type(size, type);
    res.status(200).json({ message: 'Games fetched successfully by type', data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch games by type', details: error.message });
  }
});

// Route to open a game session for a user
router.post('/games/open', async (req, res) => {
  const { gameId, playerId, money } = req.body;

  if (!gameId || !playerId) {
    return res.status(400).json({ error: 'Game ID and Player ID and money are required' });
  }

  try {
    const data = await openGame(playerId, gameId,money);
    res.status(200).json({ message: 'Game opened successfully', data });
  } catch (error) {
    res.status(200).json({ error: 'Failed to open game', details: error.message });
  }
});

// Route to add balance to a user
router.post('/balance/add', async (req, res) => {
  const { playerId, amount } = req.body;

  if (!playerId || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Valid Player ID and amount are required' });
  }

  try {
    const data = await addBalance(playerId, amount);
    res.status(200).json({ message: 'Balance added successfully', data  });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add balance', details: error.message });
  }
});

// Route to deduct balance from a user
router.post('/balance/deduct', async (req, res) => {
  const { playerId, amount } = req.body;

  if (!playerId || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Valid Player ID and amount are required' });
  }

  try {
    await deductBalance(playerId, amount);
    res.status(200).json({ message: 'Balance deducted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to deduct balance', details: error.message });
  }
});

module.exports = router;
