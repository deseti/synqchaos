import React, { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useMultisynq } from '../contexts/MultisynqContext';

export function LobbyPresence({ playerAvatar }) {
    const { session } = useMultisynq() || {};
    const { address } = useAccount();

    useEffect(() => {
        if (session && session.view && address && playerAvatar) {
            const playerData = { address, avatar: playerAvatar, joinedAt: Date.now() };
            session.view.publish(session.view.sessionId, "player-join", playerData);
            console.log("Published player-join event for:", address);
            return () => {
                session.view.publish(session.view.sessionId, "player-leave", address);
                console.log("Published player-leave event for:", address);
            };
        }
    }, [session, address, playerAvatar]);

    useEffect(() => {
        if (session && session.model) {
            const logPlayers = () => {
                const players = session.model.players;
                console.log("Players currently in lobby:", Object.keys(players).length, players);
            };

            const intervalId = setInterval(logPlayers, 3000);

            return () => clearInterval(intervalId);
        }
    }, [session]);

    return null;
}