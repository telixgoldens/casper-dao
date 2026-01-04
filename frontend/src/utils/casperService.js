const BACKEND_URL = "http://localhost:3001";

// Connect wallet and get user's public key
export const connectWallet = async () => {
  try {
    if (!window.CasperWalletProvider) {
      throw new Error("Casper Wallet not found. Please install Casper Wallet extension.");
    }

    const provider = window.CasperWalletProvider();
    
    const isConnected = await provider.isConnected();
    if (!isConnected) {
      await provider.requestConnection();
    }

    const activePublicKey = await provider.getActivePublicKey();
    console.log('✅ Wallet connected. Public key:', activePublicKey);
    
    return activePublicKey;
  } catch (err) {
    console.error('Wallet connection error:', err);
    throw new Error('Failed to connect wallet: ' + err.message);
  }
};

// Check if wallet is already connected
export const checkWalletConnection = async () => {
  try {
    if (!window.CasperWalletProvider) {
      return null;
    }
    
    const provider = window.CasperWalletProvider();
    const isConnected = await provider.isConnected();
    
    if (isConnected) {
      const activePublicKey = await provider.getActivePublicKey();
      return activePublicKey;
    }
    
    return null;
  } catch (err) {
    console.error('Check wallet connection error:', err);
    return null;
  }
};

// Disconnect wallet
export const disconnectWallet = async () => {
  try {
    if (!window.CasperWalletProvider) {
      return;
    }
    
    const provider = window.CasperWalletProvider();
    await provider.disconnectFromSite();
    console.log('✅ Wallet disconnected');
  } catch (err) {
    console.error('Disconnect wallet error:', err);
  }
};

export const deployCreateDao = async (userPublicKey, daoName) => {
  try {
    if (!userPublicKey) {
      throw new Error('Please connect your wallet first');
    }

    console.log('Sending create DAO request to backend...');

    const response = await fetch(`${BACKEND_URL}/deploy-create-dao`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        daoName: daoName,
        userPublicKey: userPublicKey // Send user's public key for identification
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create DAO');
    }

    console.log('✅ DAO creation successful. Deploy hash:', data.deployHash);
    return data.deployHash;

  } catch (err) {
    console.error('Create DAO error:', err);
    throw new Error('Failed to create DAO: ' + err.message);
  }
};

export const deployVote = async (userPublicKey, daoId, choice) => {
  try {
    if (!userPublicKey) {
      throw new Error('Please connect your wallet first');
    }

    console.log('Sending vote request to backend...');

    const response = await fetch(`${BACKEND_URL}/deploy-vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        daoId: daoId,
        choice: choice,
        userPublicKey: userPublicKey // Send user's public key for identification
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to vote');
    }

    console.log('✅ Vote successful. Deploy hash:', data.deployHash);
    return data.deployHash;

  } catch (err) {
    console.error('Vote error:', err);
    throw new Error('Failed to vote: ' + err.message);
  }
};

// Fetch votes for a proposal
export const getVotes = async (proposalId) => {
  try {
    const response = await fetch(`${BACKEND_URL}/votes/${proposalId}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch votes');
    }
    
    return data.votes;
  } catch (err) {
    console.error('Fetch votes error:', err);
    throw new Error('Failed to fetch votes: ' + err.message);
  }
};

// Fetch voting stats
export const getStats = async (daoId, proposalId) => {
  try {
    const response = await fetch(`${BACKEND_URL}/stats/${daoId}/${proposalId}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch stats');
    }
    
    return data;
  } catch (err) {
    console.error('Fetch stats error:', err);
    throw new Error('Failed to fetch stats: ' + err.message);
  }
};