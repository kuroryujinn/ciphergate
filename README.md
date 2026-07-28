# CipherGate — Secure File Sharing & Encryption Platform

A privacy-preserving, zero-knowledge file sharing platform built on the **Midnight Network**. CipherGate uses zero-knowledge proofs to enable secure file vaults where encrypted payloads and sharing keys are managed on-chain, and only authorized users (owner or designated recipient) can access the vault contents — all without revealing sensitive data to the public ledger.

---

## Contract Address

> ⏳ _The contract address will be populated once deployment to Preprod completes. See [Manual Deployment](#manual-deployment)._

| Network | Status |
|---------|--------|
| Preprod | Pending deployment |
| Preview | Pending deployment |

---

## Table of Contents

- [Project Inspiration & Product Idea](#project-inspiration--product-idea)
- [Features](#features)
- [Architecture](#architecture)
  - [Component Interaction Diagram](#component-interaction-diagram)
  - [Vault State Machine](#vault-state-machine)
  - [Circuit Lifecycle](#circuit-lifecycle)
- [Privacy Model](#privacy-model)
  - [Public State vs Private Witnesses](#public-state-vs-private-witnesses)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Compile](#compile)
- [Build](#build)
- [Run Tests](#run-tests)
- [Manual Deployment](#manual-deployment)
- [CLI Usage](#cli-usage)
- [Web UI Usage](#web-ui-usage)
- [Vercel Deploy](#vercel-deploy)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)
- [Useful Links](#useful-links)

---

## Project Inspiration & Product Idea

CipherGate was born from a simple observation: current file-sharing solutions force users to choose between **convenience** (centralized platforms like Google Drive or Dropbox) and **privacy** (manual encryption tools like PGP or age). Even "zero-knowledge" cloud providers still control access to your data through their servers.

**The idea:** Build an on-chain file vault system where:
- The **vault** (encrypted payload + access policy) lives on a public ledger
- **Access control** is enforced by zero-knowledge proofs — not server-side logic
- **Encryption keys** are never revealed to the network; only their wrapped (encrypted) form is stored on-chain
- **Authorization** is proven, not declared — the contract never sees who you are, only that you belong to an authorized set

CipherGate demonstrates that Midnight Network's Compact language and zero-knowledge primitives make it possible to build privacy-preserving applications where the blockchain is a trustless **policy enforcer** rather than a **data repository**.

---

## Features

- **🔐 Encrypted File Vaults** — Upload encrypted file metadata/IPFS references to an on-chain vault. The actual file content never touches the blockchain.
- **🔑 Zero-Knowledge Access Control** — Only the vault owner or an explicitly authorized recipient can access the vault's sharing key. Authorization is verified via zero-knowledge proofs.
- **👤 Role-Based Permissions** — Three roles: **Owner** (upload, share, revoke), **Authorized Recipient** (access sharing key), and **Bystander** (view ledger state only).
- **📋 Immutable Audit Trail** — Every access to a shared vault increments an on-chain counter, providing a transparent, tamper-evident audit log.
- **🔄 Share & Revoke** — Share vault access with any Midnight wallet public key, and revoke access at any time as the vault owner.
- **🌐 CLI & Web UI** — Interact with CipherGate via a feature-rich command-line interface or a modern React web application.
- **🔒 Privacy by Design** — All payloads and sharing keys are stored as opaque strings. The contract never decrypts or inspects file contents — encryption/decryption happens entirely client-side.

---

## Architecture

### Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        User / Client                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────────────┐  │
│  │  CLI (Node)  │  │  Web UI      │  │  1AM Wallet Extension     │  │
│  │  ciphergate- │  │  (React 19)  │  │  (dapp-connector-api)     │  │
│  │  cli/src/    │  │  ciphergate- │  │                           │  │
│  │  index.ts    │  │  ui/src/     │  │  window.midnight          │  │
│  └──────┬───────┘  └──────┬───────┘  │  .connect(networkId)      │  │
│         │                 │          └───────────┬───────────────┘  │
│         │                 │                      │                  │
│         └────────┬────────┘──────────────────────┘                  │
│                  │                                                  │
│          ┌───────▼────────┐                                         │
│          │  CipherGateAPI  │                                         │
│          │  (api/src/)     │                                         │
│          │                 │                                         │
│          │  deploy()       │                                         │
│          │  join()         │                                         │
│          │  uploadVault()  │                                         │
│          │  shareVault()   │                                         │
│          │  accessVault()  │                                         │
│          │  revokeVault()  │                                         │
│          └───────┬────────┘                                         │
│                  │                                                  │
└──────────────────┼──────────────────────────────────────────────────┘
                   │
    ┌──────────────┼──────────────────┐
    │              │                  │
    ▼              ▼                  ▼
┌────────┐ ┌────────────┐ ┌────────────────┐
│Indexer │ │Proof Server│ │ 1AM / Wallet  │
│(GraphQL)│ │(Docker)    │ │  SDK           │
│        │ │            │ │  (balance/submit)│
└───┬────┘ └─────┬──────┘ └───────┬────────┘
    │            │                │
    └────────────┼────────────────┘
                 │
         ┌───────▼────────┐
         │  Midnight Node  │
         │  (Preview /     │
         │   Preprod)      │
         │                 │
         │  CipherGate     │
         │  Contract       │
         │  (Compact)      │
         └────────────────┘
```

### Vault State Machine

```
                   ┌──────────┐
                   │  VACANT  │
                   └────┬─────┘
                        │
              ┌─────────▼─────────┐
              │  uploadVault()    │
              │  Owner sets:      │
              │  - owner pubkey   │
              │  - encrypted      │
              │    payload        │
              └─────────┬─────────┘
                        │
                   ┌────▼─────┐
                   │ PRIVATE  │◄──────────────────────────────┐
                   └────┬─────┘                               │
                        │                                      │
              ┌─────────▼─────────┐                            │
              │  shareVault()     │                            │
              │  Owner sets:      │                            │
              │  - recipient      │                            │
              │  - encrypted      │                            │
              │    sharing key    │                            │
              └─────────┬─────────┘                            │
                        │                                      │
                   ┌────▼─────┐                                │
                   │  SHARED  ├──────────────────────────────┐ │
                   └────┬─────┘   revokeVault()              │ │
                        │         (returns to PRIVATE)       │ │
              ┌─────────▼─────────┐                            │
              │  accessVault()    │                            │
              │  Owner or         │                            │
              │  Recipient can:   │                            │
              │  - retrieve key   │                            │
              │  - audit++        │                            │
              └───────────────────┘                            │
                                                               │
              ┌──────────────────────────────────────────────┐ │
              │  Only ONE vault per contract deployment.    │ │
              │  Cannot re-upload once payload exists.      │ │
              │  uploadVault() on non-VACANT state fails.   └─┘
              └──────────────────────────────────────────────┘
```

### Circuit Lifecycle

#### `uploadVault(payload: Opaque<"string">)`
1. Asserts `state == VACANT` (vault must be empty)
2. Derives owner's public key from secret witness via `publicKey(localSecretKey())`
3. Stores owner public key and encrypted payload on the ledger
4. Transitions state to `PRIVATE`

#### `shareVault(recipient: Bytes<32>, encSharingKey: Opaque<"string">)`
1. Asserts `state == PRIVATE || state == SHARED` (vault must exist)
2. Asserts caller is the owner via `publicKey(localSecretKey()) == owner`
3. Stores recipient's public key and encrypted sharing key on the ledger
4. Transitions state to `SHARED`

#### `accessVault(): Opaque<"string">`
1. Asserts `state == SHARED` (vault must be shared)
2. Proves caller is either the owner OR the authorized recipient via zero-knowledge
3. Increments immutable access counter (audit trail)
4. Returns the encrypted sharing key from the ledger

#### `revokeVault()`
1. Asserts `state == SHARED || state == PRIVATE` (vault must exist)
2. Asserts caller is the owner
3. Clears recipient and encrypted sharing key from the ledger
4. Transitions state back to `PRIVATE`

---

## Privacy Model

### Public State vs Private Witnesses

A core design principle of CipherGate — and Midnight Network — is the separation between **public ledger state** and **private witnesses**.

**Public State (on-chain, visible to everyone):**
| Field | Description |
|-------|-------------|
| `state` | Vault lifecycle state: `VACANT`, `PRIVATE`, or `SHARED` |
| `owner` | Public key of the vault owner (a hash, not the raw secret key) |
| `authorizedRecipient` | Public key of the authorized recipient |
| `encryptedPayload` | Opaque encrypted string — content is meaningless without the decryption key |
| `encryptedSharingKey` | Opaque encrypted string — the symmetric key wrapped for the recipient |
| `accessCount` | Monotonically increasing counter tracking every successful access |

**Private Witnesses (client-side only, never leave the user's device):**
| Witness | Description |
|---------|-------------|
| `localSecretKey` | The user's 32-byte secret key. Defined as a **witness** in the Compact contract (`witness localSecretKey(): Bytes<32>`) and provided to the circuit at proof time without ever being written to the ledger. |

**How Zero-Knowledge Proofs Bridge the Gap:**

The circuit `publicKey(sk: Bytes<32>): Bytes<32>` derives a public key from the secret key using a one-way hash (the circuit doesn't reveal the secret key). When a user calls `uploadVault`:
1. The user's client provides `localSecretKey` as a **private witness** (only known to the user)
2. The circuit computes `publicKey(localSecretKey())` and stores the result as the `owner` field
3. When the owner later calls `shareVault`, the circuit proves `publicKey(localSecretKey()) == owner` — proving ownership without revealing the secret key

This means:
- **The blockchain never sees your secret key** — it only sees a commitment (the public key hash)
- **The blockchain cannot distinguish between the owner and recipient calling `accessVault`** — it only knows one of the two authorized parties did
- **A bystander can observe the vault state but cannot decrypt or access any content**
- **The proof server generates a zero-knowledge proof attesting that the caller knows a secret key whose public key matches an authorized on-chain value** — without revealing which key it is

---

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
| Wallet Integration | Midnight 1AM Wallet / Wallet SDK |
| Testing | Vitest, Compact Simulator |

---

## Folder Structure

```
ciphergate/
├── contract/                   # Compact smart contract
│   └── src/
│       ├── ciphergate.compact  # Main contract source (Compact language)
│       ├── managed/            # Compiled compact artifacts (auto-generated)
│       │   ├── contract/       #   TypeScript bindings
│       │   ├── keys/           #   Prover & verifier keys (per circuit)
│       │   ├── zkir/           #   ZK intermediate representation files
│       │   └── compiler/       #   Compiler metadata
│       ├── index.ts            # Contract entry point & exports
│       ├── witnesses.ts        # Private witness definitions
│       └── test/               # Contract tests & simulator
│           ├── ciphergate.test.ts
│           ├── ciphergate-simulator.ts
│           └── utils.ts
├── api/                        # Shared API layer
│   └── src/
│       ├── index.ts            # CipherGateAPI class (deploy, join, vault ops)
│       ├── common-types.ts     # Types & provider interfaces
│       └── utils/              # Utility functions
├── ciphergate-cli/             # Command-line interface
│   └── src/
│       ├── index.ts            # CLI entry point & interactive menu
│       ├── config.ts           # Environment configuration
│       ├── wallet-utils.ts     # Wallet management
│       ├── midnight-wallet-provider.ts
│       ├── generate-dust.ts
│       └── launcher/           # Network launchers
├── ciphergate-ui/              # Web user interface
│   └── src/
│       ├── App.tsx             # Root React component
│       ├── main.tsx            # SPA entry point
│       ├── globals.ts          # Browser polyfills
│       ├── components/         # React components
│       │   ├── Vault.tsx       #   Vault card with all operations
│       │   ├── Vault.EmptyCardContent.tsx
│       │   ├── TextPromptDialog.tsx
│       │   └── Layout/         #   Header, MainLayout
│       ├── contexts/           # React context & wallet management
│       ├── hooks/              # Custom hooks
│       └── config/             # MUI theme configuration
├── scripts/
│   ├── deploy-preprod.ts       # Preprod deployment script
│   ├── deploy-local.ts         # Local test deployment
│   ├── verify-deployment.ts    # Post-deployment verification
│   └── deploy-headless.ts      # Headless deployment
├── .github/                    # CI/CD workflows & issue templates
└── package.json                # Root workspace configuration
```

---

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

### 4. Midnight 1AM Wallet (UI Only)

Install the [1AM Wallet](https://wallet.1am.network) browser extension for web UI access to Midnight.

---

## Installation

```bash
# Clone the repository
git clone https://github.com/kuroryujinn/ciphergate
cd ciphergate

# Install all workspace dependencies
npm install --legacy-peer-deps
```

---

## Compile

Compile the Compact smart contract to generate TypeScript bindings and zero-knowledge circuit artifacts:

```bash
npm run compact
```

Expected output:
```
Compiling 4 circuits:
  circuit "uploadVault" (...)
  circuit "shareVault" (...)
  circuit "accessVault" (...)
  circuit "revokeVault" (...)
```

This generates artifacts in `contract/src/managed/ciphergate/`:
- `contract/index.js` — TypeScript bindings for the contract
- `keys/*.prover` / `keys/*.verifier` — Prover and verifier keys for each circuit
- `zkir/*.zkir` / `zkir/*.bzkir` — ZK intermediate representation
- `compiler/contract-info.json` — Compiler metadata

---

## Build

```bash
# Full workspace build (compact → contract → CLI → UI)
npm run build
```

Or build individual workspaces:

```bash
# Contract (TypeScript compilation + artifact copy)
cd contract && npm run build && cd ..

# API layer
cd api && npm run build && cd ..

# CLI
cd ciphergate-cli && npm run build && cd ..

# Web UI
cd ciphergate-ui && npm run build && cd ..
```

---

## Run Tests

```bash
cd contract
npm run test
```

Expected output:
```
 ✓ src/test/ciphergate.test.ts (9 tests) 260ms

 Test Files  1 passed (1)
      Tests  9 passed (9)
```

**Test Coverage:**
| Test | Circuit(s) | Edge Case |
|------|-----------|-----------|
| Initial ledger state | Constructor | Deterministic generation |
| Upload encrypted vault | `uploadVault` | State transitions to PRIVATE |
| Share vault with recipient | `shareVault` | Recipient public key stored |
| Access vault as recipient | `accessVault` | Audit counter increments |
| Revoke sharing access | `revokeVault` | Returns to PRIVATE state |
| Prevent duplicate upload | `uploadVault` | Rejects when state != VACANT |
| Prevent unauthorized access | `accessVault` | Rejects bystander |
| Prevent non-owner share | `shareVault` | Rejects attacker |

---

## Manual Deployment

Deployment requires a running proof server and a funded wallet. Once Midnight Preprod/Preview RPC is available:

### Prerequisites

1. Start the proof server:
   ```bash
   docker run -p 6300:6300 midnightnetwork/proof-server
   ```

2. Fund your wallet with tNIGHT tokens from the [Preprod Faucet](https://midnight-tmnight-preprod.nethermind.dev/)

### Deploy to Preprod

```bash
NODE_OPTIONS="--max-old-space-size=12288" npm run deploy -- --network preprod
```

This will output the contract address. Save it and update this README.

### Verify Deployment

```bash
NODE_OPTIONS="--max-old-space-size=12288" node --experimental-specifier-resolution=node --loader ts-node/esm scripts/verify-deployment.ts
```

---

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

---

## Web UI Usage

```bash
cd ciphergate-ui
npm run build:start
```

Then open the local server URL (printed to console) and authorize the Midnight 1AM wallet extension.

The UI provides:
- **Connect Wallet** button (disconnected state)
- **Wallet status** badge with connection indicator
- **Disconnect** button (connected state)
- **Error display** with retry option (error state)
- **Deploy new vault** or **Join existing vault** cards
- **Upload, Share, Access, Revoke** operations per vault
- **Copy contract address** to clipboard
- Real-time state updates via RxJS

---

## Vercel Deploy

CipherGate is configured for one-click deployment on Vercel via the included [`vercel.json`](vercel.json).

### Deploy Steps

1. Push the repository to GitHub: `https://github.com/kuroryujinn/ciphergate`
2. Go to **[vercel.com/new](https://vercel.com/new)** and click **Import Git Repository**
3. Select `kuroryujinn/ciphergate` — `vercel.json` is auto-detected
4. Configure the **only** required environment variable:

   | Name | Value |
   |------|-------|
   | `VITE_NETWORK_ID` | `preprod` |

5. Click **Deploy** — Vercel runs:

   ```
   npm install --legacy-peer-deps
   cd ciphergate-ui && vite build --mode preprod
   cp -r ../contract/src/managed/ciphergate/keys ./dist/keys
   cp -r ../contract/src/managed/ciphergate/zkir ./dist/zkir
   ```

6. Open the deployed URL — the app loads as a fully static SPA.

### What's Included in the Build

- All 4 Compiled Compact circuits (prover + verifier keys)
- ZKIR circuit artifacts
- React SPA with MUI 9, Midnight SDK
- Health check at `window.__CIPHERGATE_HEALTH__` (browser console)
- Deployment Status dashboard (Status tab in-app)

### Contract Deployment (Separate Step)

The Vercel deployment serves the frontend only. Contract deployment to the Midnight network requires the proof server and funded wallet — see [Manual Deployment](#manual-deployment) for full instructions.

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_NETWORK_ID` | Midnight network ID | `preprod` |
| `VITE_LOGGING_LEVEL` | Pino logging level | `info` |
| `PROOF_SERVER_URL` | Proof server endpoint | `http://127.0.0.1:6300` |
| `WALLET_SEED` | Wallet seed for deployment | Random (auto-generated) |

---

## Limitations

### Deployment Infrastructure Unavailable

The Midnight Preprod RPC and proof server are currently unavailable, making live deployment
impossible at this time. The following components depend on this infrastructure:

- **Contract deployment** to the Midnight Preprod network (proof server + indexer + node)
- **Live contract address** generation and verification
- **On-chain circuit execution** with real zero-knowledge proofs
- **End-to-end integration testing** against a live network

**What has been done:**

- All deployment scripts (`scripts/deploy-preprod.ts`, `scripts/deploy-local.ts`, `scripts/deploy-headless.ts`) are fully implemented and tested
- All 4 Compact circuits are compiled with prover/verifier keys generated
- Contract tests (9/9) pass using the Compact simulator
- The frontend is fully wired to the deployment flow and ready to work once a valid contract address becomes available
- Wallet integration is complete with session persistence and auto-reconnect

**When infrastructure is restored, the only remaining step is:**

```bash
# Start proof server
docker run -p 6300:6300 midnightnetwork/proof-server

# Deploy contract to Preprod
PROOF_SERVER_URL=http://127.0.0.1:6300 WALLET_SEED=<your_seed> npm run deploy
```

### Single Vault per Contract

Each CipherGate contract deployment supports exactly **one vault**. Multiple vaults require
multiple deployments. This is a design constraint of the current Compact contract — the
vault state machine can only track a single encrypted payload, owner, and recipient at a time.

### Client-Side Encryption Assumed

CipherGate stores and retrieves **opaque encrypted payloads** on-chain. The encryption
and decryption of file data happen entirely client-side. The project provides the
infrastructure for secure sharing but does not prescribe a specific encryption scheme —
users must handle their own key management.

### No Key Recovery

If the secret key (`localSecretKey` witness) is lost, the vault and all its content
become permanently inaccessible. There is no key recovery mechanism. This is intentional
for privacy (no backdoor), but users must back up their keys.

---

## Future Work

### Multi-Vault Support per Contract

Extend the Compact contract to support multiple vaults within a single deployment,
reducing deployment costs and enabling vault management dashboards.

### Encryption Key Management UI

Add built-in encryption/decryption to the frontend, allowing users to encrypt files
before uploading and decrypt after retrieval, with clear key management workflows.

### Wallet Session Persistence Improvements

- Store wallet connection preference in `localStorage` for longer persistence
- Add session timeout configuration
- Implement secure key backup and restore

### Mobile Support

Optimize the UI for mobile browsers with responsive layouts and touch-friendly interactions.
PWA support with offline capability for viewing vault metadata.

### Cross-Chain Support

Explore deployment to additional Midnight Network environments (Preview, Mainnet) and
potentially other ZK-capable blockchains.

### Enhanced Audit Dashboard

Build a full audit view showing access history with timestamps and participant addresses,
with export capabilities for compliance use cases.

### Notification System

Add event-driven notifications when:
- Vault access is granted or revoked
- New access audit entries are created
- Transaction confirmations are received

---

## Demo Walkthrough

### Setup

1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/kuroryujinn/ciphergate
   cd ciphergate
   npm install --legacy-peer-deps
   ```

2. Compile the Compact contracts:
   ```bash
   npm run compact
   ```

3. Start the development server:
   ```bash
   cd ciphergate-ui
   npm run dev
   ```

4. Open the URL printed by Vite (typically `http://localhost:5173`) in your browser.

### User Flow

#### Step 1: Connect Wallet
- Click **Connect Wallet** in the header
- The Midnight 1AM Wallet extension will prompt for authorization
- Once connected, the header shows a green **Connected** badge
- The network ID (e.g., `preprod`) appears next to the wallet badge

#### Step 2: Navigate the Application
- Use the tabs in the header to switch between views:
  - **Vault** — Main vault management dashboard
  - **Privacy** — Interactive privacy architecture visualization
  - **Architecture** — Full technology stack diagram
  - **Status** — Deployment readiness dashboard

#### Step 3: Deploy or Join a Vault
- On the Vault page, click the **Deploy new vault** button (⊕ icon) to create a new contract
- Or click **Join existing vault** (🔗 icon) and enter a contract address in hex format

#### Step 4: Upload Encrypted Payload (Owner)
- When the vault is in `VACANT` state, a text field appears
- Paste your encrypted file metadata and click the **Upload** button
- The circuit execution lifecycle is displayed during processing

#### Step 5: Share Vault (Owner)
- When the vault is in `PRIVATE` state, sharing fields appear
- Enter the **recipient public key** (hex) and **encrypted sharing key**
- Click the **Share** button

#### Step 6: Access Vault (Owner or Recipient)
- When the vault is in `SHARED` state, click the **Access** button
- The encrypted sharing key is retrieved on-chain

#### Step 7: Revoke Access (Owner)
- Click the **Revoke** button (block icon)
- A confirmation dialog appears — click **Confirm Revoke** to proceed
- The vault returns to `PRIVATE` state

### Privacy Verification

Switch to the **Privacy** tab to see:
- The full data flow from secret key to public ledger
- Which data is private (client-side) vs. public (on-chain)
- The zero-knowledge proof lifecycle
- How hash commitments protect your identity

---

## Screenshots

> 🖼️ _Screenshots will be added after contract deployment. Planned screenshots include:_
>
> **Landing Page** — Vault creation/join interface with wallet disconnected state
>
> **Wallet Connection** — Connected state with network badge and disconnect option
>
> **Vault Dashboard** — Active vault with state chips (VACANT/PRIVATE/SHARED), action buttons, and circuit execution lifecycle
>
> **Privacy Dashboard** — Flow diagram showing secret → witness → hash commitment → ZK proof → encrypted payload → public ledger
>
> **Architecture Page** — Full stack visualization with component availability status
>
> **Deployment Status Page** — Real-time dashboard of all deployment prerequisites

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `npm install` fails | Use Node.js v22+. Try `--legacy-peer-deps`. |
| Contract compilation fails | Ensure `compact` CLI is installed: `npm install -g @midnight-ntwrk/compact-compiler` |
| Proof server connection error | Run `docker run -p 6300:6300 midnightnetwork/proof-server` |
| Wallet balance insufficient | Visit the [Preprod Faucet](https://midnight-tmnight-preprod.nethermind.dev/) |
| 1AM wallet not detected | Install the [1AM Wallet Extension](https://wallet.1am.network) |
| Port 6300 already in use | `docker ps` → find and stop the existing proof server container |
| UI build fails with WASM errors | Ensure `vite-plugin-wasm` and `vite-plugin-top-level-await` are correctly configured |

---

## Useful Links

- [Midnight Documentation](https://docs.midnight.network/)
- [Compact Language Guide](https://docs.midnight.network/compact/writing)
- [Preprod Faucet](https://midnight-tmnight-preprod.nethermind.dev/)
- [1AM Wallet Extension](https://wallet.1am.network)
- [Midnight Network](https://midnight.network/)

---

## License

Apache-2.0
