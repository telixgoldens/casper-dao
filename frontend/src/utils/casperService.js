const BACKEND_URL = "http://localhost:3001";

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
    console.log('Wallet connected. Public key:', activePublicKey);
    
    return activePublicKey;
  } catch (err) {
    console.error('Wallet connection error:', err);
    throw new Error('Failed to connect wallet: ' + err.message);
  }
};

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

export const disconnectWallet = async () => {
  try {
    if (!window.CasperWalletProvider) {
      return;
    }
    
    const provider = window.CasperWalletProvider();
    await provider.disconnectFromSite();
    console.log('Wallet disconnected');
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
        userPublicKey: userPublicKey 
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create DAO');
    }

    console.log('DAO creation successful. Deploy hash:', data.deployHash);
    return data.deployHash;

  } catch (err) {
    console.error('Create DAO error:', err);
    throw new Error('Failed to create DAO: ' + err.message);
  }
};




// Update the deployVote function in frontend/src/utils/casperService.js

export async function deployVote(userPublicKey, daoId, choice) {
  try {
    if (!window.CasperWalletProvider) {
      throw new Error('Casper Wallet not found. Please install the Casper Wallet extension.');
    }

    console.log('Preparing vote deploy...');
    
    // Step 1: Get unsigned deploy from backend
    const prepareResponse = await fetch(`${BACKEND_URL}/prepare-vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        daoId,
        choice,
        userPublicKey
      })
    });

    if (!prepareResponse.ok) {
      const error = await prepareResponse.json();
      throw new Error(error.error || 'Failed to prepare vote');
    }

    const { deployJson } = await prepareResponse.json();
    
    console.log('Deploy prepared, requesting user signature...');
    
    // Step 2: Have user sign with Casper Wallet
    const provider = window.CasperWalletProvider();
    
    const signedDeployJson = await provider.sign(
      JSON.stringify(deployJson),
      userPublicKey
    );

    console.log('Deploy signed by user, submitting to network...');
    
    // Step 3: Submit BOTH the signature AND original deploy
    const submitResponse = await fetch(`${BACKEND_URL}/submit-signed-deploy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        signedDeploy: signedDeployJson,
        deployJson: deployJson,
        daoId: daoId,        
        choice: choice
      })
    });

    if (!submitResponse.ok) {
      const error = await submitResponse.json();
      throw new Error(error.error || 'Failed to submit vote');
    }

    const result = await submitResponse.json();
    
    console.log('✅ Vote submitted!', result.deployHash);
    
    return result.deployHash;
    
  } catch (error) {
    console.error('Vote error:', error);
    throw error;
  }
}

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