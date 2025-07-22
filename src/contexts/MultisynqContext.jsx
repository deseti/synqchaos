import React, { createContext, useContext, useEffect, useState } from 'react';

let PresenceModel = null;
let PresenceView = null;
let GlobalChatModel = null;
let GlobalChatView = null;

const initializeMultisynqClasses = () => {
    console.log("initializeMultisynqClasses called");
    console.log("window.Multisynq:", window.Multisynq);
    console.log("window.Multisynq keys:", window.Multisynq ? Object.keys(window.Multisynq) : null);
    
    if (!window.Multisynq) {
        console.log("Multisynq not available");
        return false;
    }
    
    if (!window.Multisynq.Model) {
        console.log("Multisynq.Model not available. Available properties:", Object.keys(window.Multisynq));
        return false;
    }
    
    if (!window.Multisynq.View) {
        console.log("Multisynq.View not available. Available properties:", Object.keys(window.Multisynq));
        return false;
    }
    
    if (!window.Multisynq) window.Multisynq = Multisynq;
    
    PresenceModel = class extends Multisynq.Model {
        init(options) {
            super.init(options);
            
            this.players = {};
            this.subscribe(this.sessionId, "player-join", this.handlePlayerJoin);
            this.subscribe(this.sessionId, "player-leave", this.handlePlayerLeave);
        }

        handlePlayerJoin(playerData) {
            this.players[playerData.address] = playerData;
        }
        
        handlePlayerLeave(playerAddress) {
            delete this.players[playerAddress];
        }
    };
    PresenceModel.register("PresenceModel");
    PresenceModel.register("PresenceModel");

 
    PresenceView = class extends Multisynq.View {};
    
    GlobalChatModel = class extends Multisynq.Model {
        init(options) {
            super.init(options);
            
            this.messages = [];
            this.users = new Map();
            this.maxMessages = 1000;
            
            this.subscribe(this.sessionId, "sendMessage", this.handleMessage);
            this.subscribe(this.sessionId, "setNickname", this.handleNickname);
            this.subscribe(this.sessionId, "view-join", this.handleUserJoin);
            this.subscribe(this.sessionId, "view-exit", this.handleUserLeave);
        }

        handleMessage(data) {
            const { userId, text, timestamp } = data;
            
            if (!text || text.trim().length === 0) return;
            if (text.length > 500) return;
            
            const user = this.users.get(userId) || { nickname: "Anonymous" };
            
            const message = {
                id: this.generateMessageId(),
                userId,
                nickname: user.nickname,
                text: text.trim(),
                timestamp: this.now(),
                serverTime: this.now()
            };
            
            this.messages.push(message);
            
            if (this.messages.length > this.maxMessages) {
                this.messages = this.messages.slice(-this.maxMessages);
            }
            
            this.publish(this.sessionId, "newMessage", message);
        }

        handleNickname(data) {
            const { userId, nickname } = data;
            
            if (!nickname || nickname.trim().length === 0) return;
            if (nickname.length > 50) return;
            
            const oldUser = this.users.get(userId);
            const newUser = {
                ...oldUser,
                userId,
                nickname: nickname.trim(),
                joinedAt: oldUser?.joinedAt || this.now(),
                lastActive: this.now()
            };
            
            this.users.set(userId, newUser);
            
            if (oldUser && oldUser.nickname !== newUser.nickname) {
                this.publish(this.sessionId, "nicknameChanged", {
                    userId,
                    oldNickname: oldUser.nickname,
                    newNickname: newUser.nickname
                });
            }
            
            this.publishUserList();
        }

        handleUserJoin(viewId) {
            if (!this.users.has(viewId)) {
                this.users.set(viewId, {
                    userId: viewId,
                    nickname: this.generateRandomNickname(),
                    joinedAt: this.now(),
                    lastActive: this.now()
                });
            }
            
            const recentMessages = this.messages.slice(-50);
            this.publish(viewId, "messageHistory", recentMessages);
            
            this.publishUserList();
            
            const user = this.users.get(viewId);
            this.publish(this.sessionId, "userJoined", {
                userId: viewId,
                nickname: user.nickname
            });
        }

        handleUserLeave(viewId) {
            const user = this.users.get(viewId);
            if (user) {
                this.users.delete(viewId);
                this.publishUserList();
                
                this.publish(this.sessionId, "userLeft", {
                    userId: viewId,
                    nickname: user.nickname
                });
            }
        }

        publishUserList() {
            const userList = Array.from(this.users.values());
            this.publish(this.sessionId, "userListUpdated", userList);
        }

        generateMessageId() {
            return `msg_${this.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }

        generateRandomNickname() {
            const adjectives = ["Happy", "Clever", "Bright", "Swift", "Kind", "Brave", "Cool", "Smart"];
            const animals = ["Panda", "Fox", "Owl", "Cat", "Dog", "Wolf", "Bear", "Eagle"];
            const adj = adjectives[Math.floor(this.random() * adjectives.length)];
            const animal = animals[Math.floor(this.random() * animals.length)];
            return `${adj}${animal}`;
        }
    };
    GlobalChatModel.register("GlobalChatModel");

    // --- Global Chat View ---
    // This class is the bridge for sending chat messages.
    GlobalChatView = class extends Multisynq.View {};
    
    console.log("Multisynq classes initialized successfully");
    return true;
};

const MultisynqContext = createContext(null);

export const useMultisynq = () => {
  return useContext(MultisynqContext);
};

export const MultisynqProvider = ({ children }) => {  
    const [session, setSession] = useState(null);
    const [chatSession, setChatSession] = useState(null);

    useEffect(() => {
        // This effect runs only once to connect to Multisynq
        const appId = import.meta.env.VITE_MULTISYNQ_APP_ID;
        const apiKey = import.meta.env.VITE_MULTISYNQ_API_KEY;

        if (!appId || !apiKey) {
            console.error("Multisynq App ID or API Key not found in .env");
            console.log("Please set VITE_MULTISYNQ_APP_ID and VITE_MULTISYNQ_API_KEY in your .env file");
            console.log("Current values:", { appId, apiKey: apiKey ? "***" + apiKey.slice(-4) : "missing" });
            return;
        }

        console.log("Initializing Multisynq with:", { 
            appId, 
            apiKey: "***" + apiKey.slice(-4),
            presenceAppId: `${appId}.presence`,
            chatAppId: `${appId}.chat`
        });

        let isMounted = true;

        const waitForMultisynq = () => {
            return new Promise((resolve) => {
                const checkMultisynq = () => {
                    console.log("Checking for Multisynq:", {
                        windowMultisynq: !!window.Multisynq,
                        MultisynqSession: !!Multisynq?.Session,
                        MultisynqModel: !!Multisynq?.Model,
                        MultisynqView: !!Multisynq?.View,
                        MultisynqApp: !!Multisynq?.App
                    });
                    
                    if (Multisynq && Multisynq.Session && Multisynq.App && typeof Multisynq.Session.join === "function") {
                        if (!PresenceModel || !PresenceView || !GlobalChatModel || !GlobalChatView) {
                            const success = initializeMultisynqClasses();
                            console.log("Multisynq classes initialized:", success);
                        }
                        resolve();
                    } else {
                        setTimeout(checkMultisynq, 100);
                    }
                };
                checkMultisynq();
            });
        };

        const init = async () => {
            try {
                await waitForMultisynq();
                
                const newSession = await Multisynq.Session.join({
                    apiKey: apiKey,
                    appId: `${appId}.presence`,
                    name: "presence-room",
                    password: "synqchaos-presence",
                    model: PresenceModel,
                    view: PresenceView
                });
                
                const newChatSession = await Multisynq.Session.join({
                    apiKey: apiKey,
                    appId: `${appId}.chat`,
                    name: "global-chat-room", 
                    password: "synqchaos-chat",
                    model: GlobalChatModel,
                    view: GlobalChatView
                });
                
                if (isMounted) {
                    setSession(newSession);
                    setChatSession(newChatSession);
                    console.log("Multisynq Sessions Joined Successfully!");
                    console.log("Presence Session ID:", newSession.id);
                    console.log("Chat Session ID:", newChatSession.id);
                }
            } catch (err) {
                console.error("Failed to join Multisynq session:", err);
            }
        };

        init();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <MultisynqContext.Provider value={{ session, chatSession }}>
            {children}
            {/* Debug info */}
            {process.env.NODE_ENV === 'development' && (
                <div style={{ 
                    position: 'fixed', 
                    top: '10px', 
                    left: '10px', 
                    background: 'rgba(0,0,0,0.8)', 
                    color: 'white', 
                    padding: '5px', 
                    fontSize: '12px',
                    zIndex: 9999
                }}>
                    Multisynq: {session ? '✅' : '❌'} | Chat: {chatSession ? '✅' : '❌'}
                </div>
            )}
        </MultisynqContext.Provider>
    );
};
