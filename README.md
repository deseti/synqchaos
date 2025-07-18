
# SynqChaos

SynqChaos is a web-based multiplayer game built with React and Vite, featuring blockchain integration on the Monad Testnet. Players select unique avatars, compete in a chaotic arena, collect data fragments, experience random mutations, and can mint their achievements as NFTs on-chain.

## Features
- **Multiplayer Game Lobby**: Connect your wallet, choose your avatar, and join the game lobby with other players.
- **Avatar Selection**: Pick from three unique Monad animal avatars: Chog, Molandak, and Moyaki.
- **NFT Integration**: Use your Chaos Orb NFTs to influence gameplay, and mint new NFTs as proof of achievement.
- **Random Mutations**: Experience unpredictable game effects like speed boosts, slow motion, reversed controls, and more.
- **Sound Effects**: Enjoy dynamic sound feedback for game events.
- **Blockchain**: Interact with the ChaosOrb smart contract to read balances, mint NFTs, and view your collection.

## Technologies Used
- **React** & **Vite** for fast, modern frontend development
- **Tailwind CSS** for styling
- **RainbowKit** & **Wagmi** for wallet connection and contract interaction
- **TanStack React Query** for data fetching
- **Monad Testnet** for blockchain integration

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/deseti/synqchaos.git
   cd synqchaos
   ```
2. Install dependencies:
   ```sh
   npm install
   # or
   yarn install
   ```
3. Start the development server:
   ```sh
   npm run dev
   # or
   yarn dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage
- Connect your wallet using RainbowKit.
- Select your avatar and join the lobby.
- Start the game, collect data fragments, and experience chaos mutations.
- Mint your Chaos Orb NFT after the game ends.
- View and select NFTs from your collection to influence future games.

## Smart Contract
- **Contract Name**: ChaosOrb
- **Network**: Monad Testnet
- **Address**: `0x01bFe93F9a12b1C2cf99Da16ec5D485f617B083B`
- **ABI**: See `src/abi/ChaosOrb.json`

## Folder Structure
- `src/components/` — React components for game UI and logic
- `src/abi/` — Smart contract ABI
- `src/assets/` and `public/avatar/` — Game images and avatars
- `src/utils/` — Utility functions (e.g., sound manager)

## Author
- [deseti](https://github.com/deseti)

## License
MIT

---
For more information, see the [GitHub repository](https://github.com/deseti/synqchaos).
