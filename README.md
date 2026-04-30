# Tomoland Contracts

Smart contracts for the Tomoland ecosystem deployed on BNB Smart Chain.

## Contracts

| Contract | Description |
|----------|-------------|
| `DappBayActivity` | On-chain activity recording for Tomoland users |

## Deployments

| Network | Contract Address |
|---------|-----------------|
| BSC Mainnet | see `deployments/mainnet.json` |
| BSC Testnet | see `deployments/testnet.json` |

## Getting Started

### Install

```bash
npm install
```

### Compile

```bash
npm run compile
```

### Test

```bash
npm test
```

### Deploy

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

Deploy to testnet:

```bash
RELAY_ADDRESS=0xYourRelayWallet npm run deploy:testnet
```

Deploy to mainnet:

```bash
RELAY_ADDRESS=0xYourRelayWallet npm run deploy:mainnet
```

### Verify on BscScan

```bash
npx hardhat verify --network bscMainnet <CONTRACT_ADDRESS> <RELAY_ADDRESS>
```

## License

MIT
