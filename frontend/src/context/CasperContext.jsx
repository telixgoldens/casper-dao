import React, { createContext, useContext, useState, useEffect } from 'react';

const CasperContext = createContext();

export const CasperProvider = ({ children }) => {
  const [activeKey, setActiveKey] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const getCasperProvider = () => {
    if (typeof window === "undefined") return null;
    return window.CasperWalletProvider;
  };

  const connectWallet = async () => {
    const provider = getCasperProvider();
    
    if (!provider) {
      alert("Please install the Casper Wallet Extension!");
      window.open("https://www.casperwallet.io/", "_blank");
      return;
    }

    try {
      console.log("Attempting to connect... provider (raw):", provider);

      
      let prov = provider;
      if (typeof provider === 'function') {
        try {
          const called = provider();
          if (called && typeof called === 'object') prov = called;
          console.log('Provider appears to be a factory function — used returned object for methods.');
        } catch (callErr) {
          console.warn('Provider is a function but calling it failed:', callErr);
        }
      }

      const keys = Object.keys(prov || {}).length ? Object.keys(prov) : Object.getOwnPropertyNames(prov || {});
      console.log('Provider inspected keys:', keys);

      let connected = false;

      if (prov && typeof prov.requestConnection === 'function') {
        connected = await prov.requestConnection();
      } else if (prov && typeof prov.connect === 'function') {
        const res = await prov.connect();
        connected = !!res;
      } else if (prov && typeof prov.enable === 'function') {
        const res = await prov.enable();
        connected = !!res;
      } else if (prov && typeof prov.request === 'function') {
        try {
          const res = await prov.request({ method: 'casper_requestConnection' });
          connected = !!res;
        } catch (e) {
          try {
            const res2 = await prov.request({ method: 'requestConnection' });
            connected = !!res2;
          } catch (ee) {
            connected = false;
          }
        }
      } else {
        console.warn('No known connection method on provider. Provider keys:', keys);
      }

      if (connected) {
        let account = null;
        if (prov && typeof prov.getActivePublicKey === 'function') {
          account = await prov.getActivePublicKey();
        } else if (prov && typeof prov.getActiveKey === 'function') {
          account = await prov.getActiveKey();
        } else if (prov && prov.activeKey) {
          account = prov.activeKey;
        }

        console.log('Connected. Active key:', account);
        setActiveKey(account);
        setIsConnected(true);
      } else {
        throw new Error('Provider did not report a successful connection');
      }
    } catch (err) {
      console.error("Connection Failed:", err);
      alert("Connection failed. Check console for details.");
    }
  };

  const disconnectWallet = async () => {
    const provider = getCasperProvider();
    if (provider) {
      try {
        await provider.disconnectFromSite();
        setActiveKey(null);
        setIsConnected(false);
      } catch (err) {
        console.error("Disconnect error:", err);
      }
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
      const provider = getCasperProvider();
      
      if (!provider) {
        console.log("Wallet provider not found immediately...");
        return;
      }

      try {
          let connected = false;

          if (typeof provider.isConnected === 'function') {
            try {
              connected = !!(await provider.isConnected());
            } catch (errIs) {
              console.warn('isConnected() threw an error:', errIs);
              connected = false;
            }
          } else if (typeof provider.isConnected === 'boolean') {
            connected = provider.isConnected;
          } else {

            try {
              const account = await provider.getActivePublicKey();
              if (account) {
                setActiveKey(account);
                setIsConnected(true);
                connected = true;
              }
            } catch (e) {
              console.log('Not connected (no isConnected and getActivePublicKey failed).');
              connected = false;
            }
          }

          if (connected && !activeKey) {
            try {
              const account = await provider.getActivePublicKey();
              setActiveKey(account);
              setIsConnected(true);
            } catch (e) {
              console.warn('Connected but failed to get active public key:', e);
            }
          }
        } catch (err) {
          console.warn('Unexpected error checking connection:', err);
        }
    };

    const timer = setTimeout(checkConnection, 1000);

    const handleAccountChange = (event) => {
        let newKey = null;
        if (event.detail && typeof event.detail === 'string') {
             newKey = event.detail; 
        } else if (event.detail && event.detail.activeKey) {
             newKey = event.detail.activeKey; 
        }

        if (newKey) {
            console.log("Account Changed:", newKey);
            setActiveKey(newKey);
            setIsConnected(true);
        } else {
            setActiveKey(null);
            setIsConnected(false);
        }
    };

    const handleDisconnect = () => {
        console.log("Disconnected event received");
        setActiveKey(null);
        setIsConnected(false);
    };
    
    window.addEventListener('casper:activeKeyChanged', handleAccountChange);
    window.addEventListener('casper:disconnected', handleDisconnect);

    return () => {
        clearTimeout(timer);
        window.removeEventListener('casper:activeKeyChanged', handleAccountChange);
        window.removeEventListener('casper:disconnected', handleDisconnect);
    };
  }, []);

  return (
    <CasperContext.Provider value={{ activeKey, isConnected, connectWallet, disconnectWallet }}>
      {children}
    </CasperContext.Provider>
  );
};

export const useCasper = () => useContext(CasperContext);