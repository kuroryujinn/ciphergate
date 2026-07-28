# CipherGate — Secure File Sharing & Encryption Platform

A privacy-preserving, zero-knowledge file sharing platform built on the **Midnight Network**. CipherGate uses zero-knowledge proofs to enable secure file vaults where encrypted payloads and sharing keys are managed on-chain, and only authorized users (owner or designated recipient) can access the vault contents — all without revealing sensitive data to the public ledger.

## Contract Address

| Network | Contract Address |
|---------|------------------|
| Preprod | `<YOUR_DEPLOYED_CONTRACT_ADDRESS>` |

> ⚠️ **This is a placeholder.** Deploy the contract manually (see [Manual Deployment](#manual-deployment)) and replace the address above and anywhere else `<YOUR_DEPLOYED_CONTRACT_ADDRESS>` appears.

## Features

- **🔐 Encrypted File Vaults** — Upload encrypted file metadata/IPFS references to an on-chain vault. The actual file content never touches the blockchain.
- **🔑 Zero-Knowledge Access Control** — Only the vault owner or an explicitly authorized recipient can access the vault's sharing key. Authorization is verified via zero-knowledge proofs.
- **👤 Role-Based Permissions** — Three roles: **Owner** (upload, share, revoke), **Authorized Recipient** (access sharing key), and **Bystander** (view ledger state only).
- **📋 Immutable Audit Trail** — Every access to a shared vault increments an on-chain counter, providing a transparent, tamper-evident audit log.
- **🔄 Share & Revoke** — Share vault access with any Midnight wallet public key, and revoke access at any time as the vault owner.
- **🌐 CLI & Web UI** — Interact with CipherGate via a feature-rich command-line interface or a modern React web application.
- **🔒 Privacy by Design** — All payloads and sharing keys are stored as opaque strings. The contract never decrypts or inspects file contents — encryption/decryption happens entirely client-side.

## What This Project Does

CipherGate demonstrates how to build a **secure file sharing application** on Midnight using **Compact smart contracts** and **zero-knowledge proofs**. The core workflow:

1. A user deploys a **CipherGate vault** contract
2. The owner uploads encrypted file metadata (e.g., an IPFS hash or encrypted reference)
3. The owner authorizes a recipient by publishing an encrypted sharing key
4. The recipient proves their authorization via a zero-knowledge proof and retrieves the sharing key
5. Every access is recorded on-chain for auditability
6. The owner can revoke sharing access at any time

## Privacy Model

### Public (On-Chain) Information
- Vault state (`VACANT`, `PRIVATE`, or `SHARED`)
- Owner's public key (derived hash of the secret key)
- Authorized recipient's public key
- Encrypted payload (opaque string — content unknown to the chain)
- Encrypted sharing key (opaque string — content unknown to the chain)
- Access count (immutable audit counter)

### Private Information
- User's secret key (never leaves the client)
- The actual file content (encrypted/decrypted off-chain)
- The symmetric encryption key used to encrypt the file

### What Users Prove Without Revealing
- **Owner** proves possession of the secret key corresponding to the owner public key (without revealing the key itself)
- **Recipient** proves their public key matches the `authorizedRecipient` on the vault (verified via zero-knowledge)
- Access authorization is verified entirely through zero-knowledge proofs — no passwords or secrets are transmitted

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | [Compact](https://docs.midnight.network/compact/writing) Language |
| Runtime | Midnight Network (Compact Runtime v0.16) |
| Frontend | React 19, MUI 9, TypeScript |
| State Management | RxJS Observables |
| Build Tooling | Vite 8, TypeScript 5.9 |
| CLI | Node.js 24, ts-node |
| Zero-Knowledge Proofs | Midnight Proof Server (Docker) |
| Wallet Integration | Midnight Lace Wallet / Wallet SDK |
| Testing | Vitest, Compact Simulator |

## Folder Structure

```
ciphergate/
├── contract/                   # Compact smart contract
│   └── src/
│       ├── ciphergate.compact  # Main contract source
│       ├── managed/            # Compiled compact artifacts (auto-generated)
│       ├── index.ts            # Contract entry point & exports
│       ├── witnesses.ts        # Private witness definitions
│       └── test/               # Contract tests & simulator
├── api/                        # Shared API layer (types, providers, contract API)
│   └── src/
│       ├── index.ts            # CipherGateAPI class (deploy, join, upload, share, etc.)
│       ├── common-types.ts     # Shared types & provider interfaces
│       └── utils/              # Utility functions
├── ciphergate-cli/             # Command-line interface
│   └── src/
│       ├── index.ts            # CLI entry point & interactive loop
│       ├── config.ts           # Environment configuration
│       ├── wallet-utils.ts     # Wallet management utilities
│       ├── midnight-wallet-provider.ts
│       └── launcher/           # Network-specific launchers
├── ciphergate-ui/              # Web user interface
│   └── src/
│       ├── App.tsx             # Root React component
│       ├── main.tsx            # SPA entry point
│       ├── components/         # React components (Vault, Layout, Dialog)
│       ├── contexts/           # React context & state management
│       ├── hooks/              # Custom React hooks
│       └── config/             # Theme & application config
├── scripts/
│   └── deploy-preprod.ts       # Non-interactive deploy script
├── .github/                    # GitHub CI/CD & issue templates
└── package.json                # Root workspace configuration
```

## Prerequisites

### 1. Node.js v22+

```bash
node --version
```
Expected: `v22.x.x` or higher.

### 2. Docker

```bash
docker --version
```
Docker Desktop must be running. Required for the proof server.

### 3. Compact Compiler

```bash
npm install -g @midnight-ntwrk/compact-compiler
compact --version
```
Expected: `0.5.x` or later.

### 4. Midnight Lace Wallet (UI Only)

Install the [Lace Wallet](https://chromewebstore.google.com/detail/lace/gafhhkghbfjjkeiendhlofajokpaflmk) browser extension for web UI access to Midnight.

## Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd ciphergate

# Install root dependencies (npm workspaces)
npm install --legacy-peer-deps

# Install contract dependencies
cd contract && npm install && cd ..

# Install API dependencies
cd api && npm install && cd ..

# Install CLI dependencies
cd ciphergate-cli && npm install && cd ..
```

## Compile

Compile the Compact smart contract to generate TypeScript bindings and zero-knowledge circuit artifacts:

```bash
cd contract
npm run compact
cd ..
```

Expected output:
```
Compiling 4 circuits:
  circuit "uploadVault" (...)
  circuit "shareVault" (...)
  circuit "accessVault" (...)
  circuit "revokeVault" (...)
```

## Build

```bash
# Build the contract (TypeScript compilation)
cd contract && npm run build && cd ..

# Build the API layer
cd api && npm run build && cd ..

# Build the CLI
cd ciphergate-cli && npm run build && cd ..

# Build the UI
cd ciphergate-ui && npm run build && cd ..
```

Or from the workspace root:

```bash
npm run build
```

## Run Tests

```bash
cd contract
npm run test
```

## Manual Deployment

**Deployment is intentionally skipped during development.** After building, deploy the contract manually:

### Prerequisites for Deployment

1. Start the proof server:
   ```bash
   docker run -p 6300:6300 midnightnetwork/proof-server
   ```

2. Fund your wallet with tNIGHT tokens from the [Preprod Faucet](https://midnight-tmnight-preprod.nethermind.dev/)

### Deploy to Preprod

```bash
NODE_OPTIONS="--max-old-space-size=12288" npm run deploy -- --network preprod
```

This will output the contract address. **Save this address.**

### Deploy to Preview

```bash
NODE_OPTIONS="--max-old-space-size=12288" node --experimental-specifier-resolution=node --loader ts-node/esm scripts/deploy-preprod.ts
```

> Modify `scripts/deploy-preprod.ts` to target the preview network if needed.

## After Deployment

Once you have the deployed contract address:

1. **Replace the placeholder** in this README: `README.md` → `| Preprod | \`<YOUR_DEPLOYED_CONTRACT_ADDRESS>\` |`
2. Replace any other instances of `<YOUR_DEPLOYED_CONTRACT_ADDRESS>` throughout the project
3. Start using the application via CLI or UI

**No additional coding is required.** The application is fully wired to connect to any deployed contract at runtime.

## CLI Usage

```bash
# Standalone (local test environment)
cd ciphergate-cli
npm run standalone

# Preprod network
npm run preprod-remote

# Preview network
npm run preview-remote
```

The CLI provides an interactive menu for:
1. Deploying a new vault contract
2. Joining an existing vault contract
3. Uploading encrypted file metadata (owner)
4. Sharing vault with a recipient (owner)
5. Accessing/sharing key (owner or recipient)
6. Revoking access (owner)
7. Viewing ledger state, private state, and derived state

## Web UI Usage

```bash
cd ciphergate-ui
npm run build:start
```

Then open `http://127.0.0.1:8080` and authorize the Midnight Lace wallet extension.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_NETWORK_ID` | Midnight network ID | `preprod` |
| `VITE_LOGGING_LEVEL` | Pino logging level | `info` |
| `PROOF_SERVER_URL` | Proof server endpoint | `http://127.0.0.1:6300` |
| `WALLET_SEED` | Wallet seed for deployment | Random (auto-generated) |

## Screenshots

> 🖼️ _Screenshots to be added after deployment._

## Initial Idea

> 📝 _Fill in the initial project idea or inspiration here._

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `npm install` fails | Use Node.js v22+. Try `--legacy-peer-deps`. |
| Contract compilation fails | Ensure `compact` CLI is installed: `npm install -g @midnight-ntwrk/compact-compiler` |
| Proof server connection error | Run `docker run -p 6300:6300 midnightnetwork/proof-server` |
| Wallet balance insufficient | Visit the [Preprod Faucet](https://midnight-tmnight-preprod.nethermind.dev/) |
| Lace wallet not detected | Install the [Lace Extension](https://chromewebstore.google.com/detail/lace/gafhhkghbfjjkeiendhlofajokpaflmk) |
| Port 6300 already in use | `docker ps` → find and stop the existing proof server container |
| UI build fails with WASM errors | Ensure `vite-plugin-wasm` and `vite-plugin-top-level-await` are correctly configured |

## Useful Links

- [Midnight Documentation](https://docs.midnight.network/)
- [Compact Language Guide](https://docs.midnight.network/compact/writing)
- [Preprod Faucet](https://midnight-tmnight-preprod.nethermind.dev/)
- [Lace Wallet Extension](https://chromewebstore.google.com/detail/lace/gafhhkghbfjjkeiendhlofajokpaflmk)
- [Midnight Network](https://midnight.network/)

## License

Apache-2.0
