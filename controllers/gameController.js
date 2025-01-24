const axios = require('axios');

const username = 'api_benzowin';
const password = 'iszgrOp0';
const baseUrl = 'https://api-int.qtplatform.com';
const authUrl = 'https://api-int.qtplatform.com/v1/auth/token';
const gamesUrl = 'https://api-int.qtplatform.com/v2/games';

// Function to get the access token
async function getAccessToken() {
  try {
    const response = await axios.post(
      `${authUrl}?grant_type=password&response_type=token&username=${username}&password=${password}`,
      null,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Error fetching access token:', error.response?.data || error.message);
    throw error;
  }
}

// Function to fetch the game list
async function getGameList(size) {
  try {
    const token = await getAccessToken();
    const response = await axios.get(gamesUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Time-Zone': 'UTC',
        'Accept-Language': 'en-US',
        Accept: 'application/json',
      },
      params: {
        size, // Use the dynamic size from the user
        currencies: 'USD,CNY',
        languages: 'en_US',
        sortBy: 'popularity',
        orderBy: 'DESC',
      },
    });
    return response.data; // Return the fetched data
  } catch (error) {
    console.error('Error fetching game list:', error.response?.data || error.message);
    throw error;
  }
}

async function getGameList_by_provide(size, provide) {
  try {
      
      
    console.log("provide", provide);
    const token = await getAccessToken();
    const response = await axios.get(gamesUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Time-Zone': 'UTC',
        'Accept-Language': 'en-US',
        Accept: 'application/json',
      },
      
      params: {
        size, // Use the dynamic size from the user
        currencies: 'USD,CNY',
        languages: 'en_US',
        sortBy: 'popularity',
        orderBy: 'DESC',
        providers: provide, // Add the 'provide' parameter to filter games by provider
      },
    });
    
    
    return response.data; // Return the fetched data
  } catch (error) {
    console.error('Error fetching game list by provider:', error.response?.data || error.message);
    throw error;
  }
}

async function getGameList_by_type(size, provide) {
  try {
      
      
    console.log("provide", provide);
    const token = await getAccessToken();
    const response = await axios.get(gamesUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Time-Zone': 'UTC',
        'Accept-Language': 'en-US',
        Accept: 'application/json',
      },
      
      params: {
        size, // Use the dynamic size from the user
        currencies: 'USD,CNY',
        languages: 'en_US',
        sortBy: 'popularity',
        orderBy: 'DESC',
        gameTypes: provide, // Add the 'provide' parameter to filter games by provider
      },
    });
    
    
    return response.data; // Return the fetched data
  } catch (error) {
    console.error('Error fetching game list by provider:', error.response?.data || error.message);
    throw error;
  }
}


// API controller function
async function fetchGameList(size) {
  
  if (isNaN(size) || size <= 0) {
    return res.status(400).json({ error: 'Invalid size parameter. Please provide a positive number.' });
  }

  try {
    const gameList = await getGameList(size);
    return gameList; // Return the game list as JSON
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch game list', details: error.response?.data || error.message });
  }
}

// Function to create a user (by initializing with a balance or game session)
async function createUser(playerId) {
  try {
    const token = await getAccessToken();
    const payload = {
      type: 'CREDIT', // Transaction type, must be CREDIT for adding balance
      referenceId: `create-${Date.now()}`, // Unique reference ID
      playerId: playerId,
      amount: 0.01, // Minimum amount allowed by the API
      currency: 'INR', // Default currency
    };

    console.log('Payload:', payload);

    const response = await axios.post(
      `${baseUrl}/v1/fund-transfers`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('User created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error.response?.data || error.message);
    throw error;
  }
}


async function openGame(playerId, gameId, money) {
  try {
    const token = await getAccessToken();
    const payload = {
      playerId: playerId,
      currency: 'INR', // Default currency
      lang: 'en_US',   // Default language
      mode: 'real',    // Real mode gameplay
      device: 'desktop', // Device type
      country: 'IN',  
    };

    const response = await axios.post(
      `${baseUrl}/v1/games/${gameId}/launch-url`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (money != 0 ) {
      const balanceResponse = await addBalance(playerId, money);
      console.log('Balance response:', balanceResponse);
      console.log('Game opened successfully:', response.data.url);
      
      return {
        gameUrl: response.data.url,
        balanceResponse: balanceResponse,
      };
    } else {
      return {
        gameUrl: response.data.url
      };
    }
  } catch (error) {
    const errorMessage = error.response?.data || {
      message: error.message,
      code: 'UNKNOWN_ERROR',
    };
    console.error('Error opening game:', errorMessage);

    // Explicitly throw the error message
    throw errorMessage;
  }
}


// Function to add balance to a user
async function addBalance(playerId, amount) {
  try {
    const token = await getAccessToken();
    const referenceId = `add-${Date.now()}`;
    const payload = {
      type: 'CREDIT',
      referenceId, // Unique reference ID
      playerId,
      amount,
      currency: 'INR',
    };
    console.log(payload);
    const response = await axios.post(
      `${baseUrl}/v1/fund-transfers`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Balance added successfully:', response.data);

    // Call completeTransfer 
    if (response.data && response.data.id) {
      const transferResponse = await completeTransfer(response.data.id);
      return {
        addBalanceResponse: response.data,
        transferResponse: transferResponse,
      };
    } else {
      console.error('No transfer ID returned from addBalance response');
      return { error: 'No transfer ID returned' };
    }
  } catch (error) {
    console.error(
      'Error adding balance:',
      error.response?.data || error.message
    );
    throw error;
  }
}

// Function to complete the transfer
async function completeTransfer(transferId) {
  try {
    const token = await getAccessToken();

    const url = `${baseUrl}/v1/fund-transfers/${transferId}/status`;

    // Setting the body for PUT request
    const payload = {
      status: 'COMPLETED', // The status to set for the transfer
    };

    console.log('Request URL:', url);  // Log the request URL
    console.log('Request Payload:', payload); // Log the payload being sent

    // Send PUT request with the payload
    const response = await axios.put(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    console.log('Transfer completed successfully:', response.data);  // Log the response data
    return response.data;
  } catch (error) {
    console.error('Error completing transfer:', error.response?.data || error.message);
    console.error('Error details:', error);  // Log the full error details
    throw error;
  }
}




async function checkBalance(playerId) {
  try {
    const token = await getAccessToken(); // Assumes this function provides the access token

    const response = await axios.get(
      `${baseUrl}/v1/wallet/ext/${playerId}`, // Use GET with path parameter
      {
        headers: {
          Authorization: `Bearer ${token}`, // Use token in Bearer format
          Accept: 'application/json',      // Specify Accept header
        },
      }
    );

    console.log('Balance fetched successfully:', response.data);

    return response.data;
  } catch (error) {
    console.error('Error fetching balance:', error.response?.data || error.message);
  }
}

// Function to deduct balance from a user
async function deductBalance(playerId, amount) {
  try {
    const token = await getAccessToken();
    const payload = {
      type: 'DEBIT',
      referenceId: `deduct-${Date.now()}`, // Unique reference ID
      playerId: playerId,
      amount: amount,
      currency: 'INR',
    };
    const response = await axios.post(
      `${baseUrl}/v1/fund-transfers`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (response.data && response.data.id) {
      await completeTransfer(response.data.id);
    } else {
      console.error('No transfer ID returned from addBalance response');
    }
    
    console.log('Balance deducted successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deducting balance:', error.response.data);
  }
}


module.exports = {
  fetchGameList,
  createUser,
  openGame,
  completeTransfer,
  checkBalance,
  addBalance,
  deductBalance,
  getGameList_by_provide,
  getGameList_by_type,
};
