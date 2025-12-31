import React, { createContext, useContext, useState, useEffect } from 'react';

const CasperContext = createContext();

export const CasperProvider = ({ children }) => {
  const [activeKey, setActiveKey] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Helper: Safely get the provider
  const getCasperProvider = () => {
    if (typeof window === "undefined") return null;
    return window.CasperWalletProvider;
  };

  // 1. Connect Function
  const connectWallet = async () => {
    const provider = getCasperProvider();
    
    if (!provider) {
      alert("Please install the Casper Wallet Extension!");
      window.open("https://www.casperwallet.io/", "_blank");
      return;
    }

    try {
      console.log("🔌 Attempting to connect... provider (raw):", provider);

      // If provider is a function (some injections are factory functions), try to call it safely
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

      // Inspect more thoroughly (non-enumerable props too) for debugging
      const keys = Object.keys(prov || {}).length ? Object.keys(prov) : Object.getOwnPropertyNames(prov || {});
      console.log('Provider inspected keys:', keys);

      // Try several possible connection APIs in order of likelihood
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
        // Last resort: some providers hide methods — try to sniff common names
        console.warn('No known connection method on provider. Provider keys:', keys);
      }

      if (connected) {
        // Try multiple ways to obtain the active public key
        let account = null;
        if (prov && typeof prov.getActivePublicKey === 'function') {
          account = await prov.getActivePublicKey();
        } else if (prov && typeof prov.getActiveKey === 'function') {
          account = await prov.getActiveKey();
        } else if (prov && prov.activeKey) {
          account = prov.activeKey;
        }

        console.log('✅ Connected. Active key:', account);
        setActiveKey(account);
        setIsConnected(true);
      } else {
        throw new Error('Provider did not report a successful connection');
      }
    } catch (err) {
      console.error("❌ Connection Failed:", err);
      // Fallback for older extension versions or different API shapes
      alert("Connection failed. Check console for details.");
    }
  };

  // 2. Disconnect Function
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

  // 3. Auto-Connect & Event Listeners
  useEffect(() => {
    const checkConnection = async () => {
      const provider = getCasperProvider();
      
      // Wait slightly for injection
      if (!provider) {
        console.log("⏳ Wallet provider not found immediately...");
        return;
      }

      try {
          // Some providers expose `isConnected()` as a function, others don't.
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
            // Fallback: try to get the active public key directly
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

    // Delay check to ensure extension is loaded
    const timer = setTimeout(checkConnection, 1000);

    // Event Listeners for Account Changes
    const handleAccountChange = (event) => {
        // The event structure can vary; we try to grab the key safely
        let newKey = null;
        if (event.detail && typeof event.detail === 'string') {
             newKey = event.detail; // Sometimes it's just the string
        } else if (event.detail && event.detail.activeKey) {
             newKey = event.detail.activeKey; // Sometimes it's an object
        }

        if (newKey) {
            console.log("🔄 Account Changed:", newKey);
            setActiveKey(newKey);
            setIsConnected(true);
        } else {
            setActiveKey(null);
            setIsConnected(false);
        }
    };

    const handleDisconnect = () => {
        console.log("🔌 Disconnected event received");
        setActiveKey(null);
        setIsConnected(false);
    };
    
    // Listen for standard events
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