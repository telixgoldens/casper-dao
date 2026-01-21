const BACKEND_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:3001";

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
export const deployCreateProposal = async (
  userPublicKey, 
  daoId, 
  title, 
  description, 
  votingDuration
) => {
  try {
    if (!userPublicKey) {
      throw new Error('Please connect your wallet first');
    }

    if (!window.CasperWalletProvider) {
      throw new Error('Casper Wallet not found');
    }

    console.log('Preparing proposal creation deploy...');
    
    const prepareResponse = await fetch(`${BACKEND_URL}/prepare-create-proposal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        daoId,
        title,
        description,
        votingDuration,
        userPublicKey
      })
    });

    if (!prepareResponse.ok) {
      const error = await prepareResponse.json();
      throw new Error(error.error || 'Failed to prepare proposal');
    }

    const { deployJson } = await prepareResponse.json();
    
    console.log('Deploy prepared, requesting user signature...');
    
    const provider = window.CasperWalletProvider();
    const signedDeployJson = await provider.sign(
      JSON.stringify(deployJson),
      userPublicKey
    );

    console.log('Deploy signed, submitting to network...');
    
    const submitResponse = await fetch(`${BACKEND_URL}/submit-signed-deploy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        signedDeploy: signedDeployJson,
        deployJson: deployJson,
        daoId: daoId,
        proposalData: { title, description, votingDuration }
      })
    });

    if (!submitResponse.ok) {
      const error = await submitResponse.json();
      throw new Error(error.error || 'Failed to submit proposal');
    }

    const result = await submitResponse.json();
    console.log('Proposal submitted!', result.deployHash);
    
    return result.deployHash;
    
  } catch (error) {
    console.error('Create proposal error:', error);
    throw error;
  }
};

export async function deployVote(userPublicKey, daoId, proposalId, choice) { // ✅ Add proposalId param
  try {
    if (!window.CasperWalletProvider) {
      throw new Error('Casper Wallet not found. Please install the Casper Wallet extension.');
    }

    console.log('Preparing vote deploy...');
    
    const prepareResponse = await fetch(`${BACKEND_URL}/prepare-vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userPublicKey,
        daoId,
        proposalId, 
        choice
      })
    });

    if (!prepareResponse.ok) {
      const error = await prepareResponse.json();
      throw new Error(error.error || 'Failed to prepare vote');
    }

    const { deployJson } = await prepareResponse.json();
    
    console.log('Deploy prepared, requesting user signature...');
    
    const provider = window.CasperWalletProvider();
    
    const signedDeployJson = await provider.sign(
      JSON.stringify(deployJson),
      userPublicKey
    );

    console.log('Deploy signed by user, submitting to network...');
    
    const submitResponse = await fetch(`${BACKEND_URL}/submit-signed-deploy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        signedDeploy: signedDeployJson,
        deployJson: deployJson,
        daoId: daoId,
        proposalId: proposalId, 
        choice: choice
      })
    });

    if (!submitResponse.ok) {
      const error = await submitResponse.json();
      throw new Error(error.error || 'Failed to submit vote');
    }

    const result = await submitResponse.json();
    
    console.log('Vote submitted!', result.deployHash);
    
    return result.deployHash;
    
  } catch (error) {
    console.error('Vote error:', error);
    throw error;
  }
}

export const getVotes = async (daoId, proposalId) => {
  try {
    const response = await fetch(`${BACKEND_URL}/votes/${daoId}/${proposalId}`);
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