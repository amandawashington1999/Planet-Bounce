# Planet Bounce 🪐

Guess which planet the system picked — but here's the twist: **nobody sees anyone's choice**. Your guess is encrypted in the browser, the system's pick is encrypted on-chain, and the match check runs on ciphertext. Only you can decrypt whether you won. Powered by FHE on Ethereum Sepolia.

## How to Play

1. Connect wallet to Sepolia testnet
2. Click "Start Game" — system encrypts a random planet
3. Pick your planet — encrypted client-side, submitted on-chain
4. Sign to decrypt — only you can reveal if you matched

## Tech Stack

| Layer | Technology |
|-------|------------|
| Contract | Solidity 0.8.24 + FHEVM v0.9 |
| Frontend | Next.js 14 + React 18 |
| FHE SDK | @zama-fhe/relayer-sdk |
| Wallet | RainbowKit + wagmi v2 |
| Style | Tailwind (Vaporwave theme) |

## Quick Start

```bash
# Frontend
cd frontend && npm install && npm run dev

# Contract (if redeploying)
cd contracts && npm install && npm run deploy
```

Open [http://localhost:3000](http://localhost:3000)

## Tests

```bash
cd contracts && npm test
```

```
✅ 17 passing (856ms)

  Deployment ............ 2 tests
  Initial State ......... 3 tests
  State Isolation ....... 2 tests
  Contract Interface .... 5 tests
  Events ................ 3 tests
  Security .............. 2 tests
```

## Contract

| Network | Address | Status |
|---------|---------|--------|
| Sepolia | [`0x3F872727a21645c50Db9E1B949B09a4f385d6f80`](https://sepolia.etherscan.io/address/0x3F872727a21645c50Db9E1B949B09a4f385d6f80#code) | ✅ Verified |

## License

MIT
