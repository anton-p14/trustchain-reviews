# TrustChain Reviews 🛡️

**Blockchain-Verified Product Review Platform on Cardano**

TrustChain Reviews is a decentralized application (dApp) that solves the crisis of trust in online reviews. By leveraging the Cardano blockchain, IPFS, and smart contracts, we ensure that every review is immutable, verifiable, and trustworthy.

![TrustChain Demo](frontend/public/vite.svg)

## 🚀 Key Features

- **Blockchain Verification**: Every review is recorded on the Cardano blockchain as a permanent, tamper-proof record.
- **Smart Contract Validation**: Reviews are validated by an Aiken smart contract (Plutus V3) to ensure integrity.
- **Decentralized Storage**: Review content is stored on IPFS, ensuring censorship resistance.
- **Wallet Integration**: Seamless connection with Eternl wallet (CIP-30 compliant).
- **Proof of Purchase**: Architecture ready for Zero-Knowledge Proofs (Midnight integration) to verify purchases without revealing identity.
- **Premium UI/UX**: Modern glassmorphism design built with React and Tailwind CSS.

## 🛠️ Tech Stack

### Frontend
- **React 18** + **Vite**: Fast, modern web framework
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **CIP-30**: Wallet connection standard

### Backend
- **Node.js** + **Express**: REST API
- **Mesh SDK**: Cardano transaction building
- **Blockfrost**: Blockchain API provider
- **CSL (Cardano Serialization Library)**: Transaction assembly
- **IPFS (Kubo)**: Decentralized content storage

### Blockchain
- **Cardano Preprod Testnet**: Network
- **Aiken**: Smart contract language
- **Plutus V3**: Smart contract platform

## 🏆 Proof of Work

We have successfully submitted real transactions to the Cardano Preprod Testnet:

- **Transaction 1**: `019ccf07e880e2bef19709aced71dd8dc8a293136ca1b7c54849e77f4461a99f`
- **Transaction 2**: `b3541ea9d6fc72bd9395688b6c2e3a144677e823a5ab32a95175a2a274cb8f52`

View them on [CardanoScan](https://preprod.cardanoscan.io).

## � Installation & Setup

### Prerequisites
- Node.js (v18+)
- IPFS Desktop or CLI
- Eternl Wallet (Browser Extension) set to Preprod Testnet

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/trustchain-reviews.git
cd trustchain-reviews
```

### 2. Setup Backend
```bash
cd backend
npm install
```
Create a `.env` file in `backend/` with your Blockfrost key:
```env
BLOCKFROST_PROJECT_ID=your_preprod_project_id
```
Start the server:
```bash
npm start
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Run IPFS
Ensure your IPFS daemon is running:
```bash
ipfs daemon
```

## 📝 How to Use

1. **Connect Wallet**: Click the "Connect Wallet" button in the top right.
2. **Browse Products**: Select a product from the homepage.
3. **Buy Product**: Click "Buy Now" to create a mock purchase record (required to review).
4. **Write Review**: Go to the product page, rate it, and write your review.
5. **Submit**: Click "Submit Review".
6. **Sign Transaction**: Approve the transaction in your Eternl wallet popup.
7. **Verify**: Wait for the success message and view your transaction on the blockchain!

## 📄 Smart Contract

The review validator is written in Aiken and ensures:
- Rating is between 1 and 5
- Transaction is signed by the reviewer
- Review content exists (hash check)
- Initial state is correct

Location: `aiken-contracts/validators/review_validator.ak`

## 🔮 Roadmap

- [x] Core Blockchain Integration
- [x] IPFS Storage
- [x] Smart Contract (Aiken)
- [ ] Midnight ZK Proof Integration (Privacy-preserving verification)
- [ ] Mainnet Deployment
- [ ] Reputation Token System

## � Team

Built for the Cardano Hackathon by **[Your Name]**.

---

*TrustChain Reviews - Restoring Trust in E-Commerce*
