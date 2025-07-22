# SynqChaos

SynqChaos is a web-based multiplayer game built with React and Vite, featuring blockchain integration on the Monad Testnet. Players select unique avatars, compete in a chaotic arena, collect data fragments, experience random mutations, and can mint their achievements as NFTs on-chain.

## Features
- **Multiplayer Game Lobby**: Connect your wallet, choose your avatar, and join the game lobby with other players.
- **Global Real-time Chat**: Chat dengan semua pemain secara real-time menggunakan Multisynq, dengan UI minimalis dan dark mode.
- **Avatar Selection**: Pick from three unique Monad animal avatars: Chog, Molandak, and Moyaki.
- **Mobile-Friendly Controls**: Virtual joystick and touch controls for smartphone gaming experience.
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices.
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
- **Multisynq** for real-time presence, lobby sync, dan global chat

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
3. Set up environment variables:
   ```sh
   cp .env.example .env
   ```
   Then edit `.env` file and add your configuration:
   ```
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_RAINBOWKIT_PROJECT_ID=your-rainbowkit-project-id
   VITE_MULTISYNQ_APP_ID=your-multisynq-app-id (format: com.yourdomain.app)
   VITE_MULTISYNQ_API_KEY=your-multisynq-api-key
   ```
   
   **Important**: 
   - Get your RainbowKit Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/)
   - Get your Supabase credentials from your [Supabase dashboard](https://supabase.com/dashboard)
   - Get your Multisynq credentials from your Multisynq dashboard
4. Start the development server:
   ```sh
   npm run dev
   # or
   yarn dev
   ```

### Mobile Testing
To test on mobile devices over WiFi:
1. Start the development server with network access:
   ```sh
   npm run dev -- --host
   ```
2. Find your computer's IP address:
   - Windows: `ipconfig` (look for IPv4 Address)
   - Mac/Linux: `ifconfig` or `ip addr`
3. On your mobile device, connect to the same WiFi network
4. Open browser and navigate to `http://YOUR_IP:5173` (e.g., )
5. Ensure Windows Firewall allows Node.js connections for Private Networks

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage
- Connect your wallet using RainbowKit.
- Select your avatar and join the lobby.
- Chat secara global dengan semua pemain secara real-time.
- Start the game, collect data fragments, and experience chaos mutations.
- **Desktop**: Use WASD or Arrow keys to move your character.
- **Mobile**: Use virtual joystick (left side) or directional buttons (right side) for touch controls.
- Mint your Chaos Orb NFT after the game ends.
- View and select NFTs from your collection to influence future games.

## Smart Contract
- **Contract Name**: ChaosOrb
- **Network**: Monad Testnet
- **Address**: `0x01bFe93F9a12b1C2cf99Da16ec5D485f617B083B`
- **ABI**: See `src/abi/ChaosOrb.json`

## Folder Structure
- `src/components/` — React components for game UI and logic
  - `VirtualControls.jsx` — Mobile touch controls component
- `src/hooks/` — Custom React hooks
  - `useHybridInput.js` — Hybrid input system for keyboard + touch
- `src/abi/` — Smart contract ABI
- `src/assets/` and `public/avatar/` — Game images and avatars
- `src/utils/` — Utility functions (e.g., sound manager)

## Author
- [deseti](https://github.com/deseti)

## License
MIT

---
For more information, see the [GitHub repository](https://github.com/deseti/synqchaos).
