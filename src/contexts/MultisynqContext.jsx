// src/contexts/MultisynqContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';

// We'll define the classes after Multisynq is loaded
let PresenceModel = null;
let PresenceView = null;

// Function to initialize Multisynq classes
const initializeMultisynqClasses = () => {
    if (!window.Multisynq) return false;
    
    // --- Multisynq Model ---
    // This class holds the synchronized data for our lobby presence feature.
    PresenceModel = class extends window.Multisynq.Model {
        init() {
            // 'this.players' is an object that will store all players currently in the lobby.
            // It will be automatically synchronized.
            this.players = {};
            // The viewId is the unique identifier for each client connected.
            this.subscribe(this.viewId, "player-join", this.handlePlayerJoin);
            this.subscribe(this.viewId, "player-leave", this.handlePlayerLeave);
        }

        handlePlayerJoin(playerData) {
            this.players[playerData.address] = playerData;
        }
        
        handlePlayerLeave(playerAddress) {
            delete this.players[playerAddress];
        }
    };
    PresenceModel.register("PresenceModel");

    // --- Multisynq View ---
    // This class is the bridge for sending messages (publishing events).
    PresenceView = class extends window.Multisynq.View {};
    
    return true;
};

// 1. Create the React Context
const MultisynqContext = createContext(null);

// 2. Create a custom hook to easily use the context
export const useMultisynq = () => {
  return useContext(MultisynqContext);
};

// 3. Create the Provider component that will wrap our app
export const MultisynqProvider = ({ children }) => {  
    const [session, setSession] = useState(null);

    useEffect(() => {
        // This effect runs only once to connect to Multisynq
        const appId = import.meta.env.VITE_MULTISYNQ_APP_ID;
        const apiKey = import.meta.env.VITE_MULTISYNQ_API_KEY;

        if (!appId || !apiKey) {
            console.error("Multisynq App ID or API Key not found in .env");
            return;
        }

        let isMounted = true;

        const waitForMultisynq = () => {
            return new Promise((resolve) => {
                const checkMultisynq = () => {
                    if (window.Multisynq && typeof window.Multisynq.joinSession === "function") {
                        // Initialize classes once Multisynq is available
                        if (!PresenceModel || !PresenceView) {
                            initializeMultisynqClasses();
                        }
                        resolve();
                    } else {
                        setTimeout(checkMultisynq, 100); // Check every 100ms
                    }
                };
                checkMultisynq();
            });
        };

        const init = async () => {
            try {
                // Wait for Multisynq library to be loaded
                await waitForMultisynq();
                
                const newSession = await window.Multisynq.joinSession({
                    appId: appId,
                    apiKey: apiKey,
                    model: PresenceModel,
                    view: PresenceView,
                });
                if (isMounted) {
                    setSession(newSession);
                    console.log("Multisynq Session Joined Successfully!");
                }
            } catch (err) {
                console.error("Failed to join Multisynq session:", err);
            }
        };

        init();

        return () => {
            isMounted = false;
            // Optionally, you can add logic here to leave the session when the app closes
        };
    }, []);

    return (
        <MultisynqContext.Provider value={session}>
            {children}
        </MultisynqContext.Provider>
    );
};
