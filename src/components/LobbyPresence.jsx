// src/components/LobbyPresence.jsx
import React, { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useMultisynq } from '../contexts/MultisynqContext';

export function LobbyPresence({ playerAvatar }) {
    const session = useMultisynq();
    const { address } = useAccount();

    // This effect runs when the component mounts (player enters lobby)
    // and cleans up when it unmounts (player leaves lobby).
    useEffect(() => {
        if (session && address && playerAvatar) {
            const playerData = { address, avatar: playerAvatar, joinedAt: Date.now() };

            // Announce that this player has joined
            session.publish(session.view.id, "player-join", playerData);
            console.log("Published player-join event for:", address);

            // The cleanup function is called when the component unmounts
            return () => {
                session.publish(session.view.id, "player-leave", address);
                console.log("Published player-leave event for:", address);
            };
        }
    }, [session, address, playerAvatar]); // Reruns if session, address, or avatar changes

    // This effect is for logging the list of players in the console for verification
    useEffect(() => {
        if (session && session.model) {
            const logPlayers = () => {
                const players = session.model.players;
                console.log("Players currently in lobby:", Object.keys(players).length, players);
            };

            // Log every 3 seconds
            const intervalId = setInterval(logPlayers, 3000);

            return () => clearInterval(intervalId);
        }
    }, [session]);

    // This component renders nothing to the UI
    return null;
}