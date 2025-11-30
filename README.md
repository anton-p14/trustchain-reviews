# TrustChain Reviews - Cardano Blockchain Review Platform

A decentralized review platform built on Cardano blockchain using Aiken smart contracts, providing tamper-proof, verified reviews with DID authentication and ZK proof privacy.

## 🎯 Project Overview

TrustChain Reviews is a blockchain-powered review and rating platform that ensures:
- **Immutable Reviews**: All reviews stored on-chain, tamper-proof
- **Verified Identities**: DID-based authentication prevents fake accounts
- **Privacy-Preserving**: Midnight ZK proofs for duplicate prevention
- **Reward System**: Honest reviewers earn tokens for verified reviews
- **Transparent**: Public blockchain verification via CardanoScan

## 🏗️ Architecture

### Smart Contracts (Aiken)
- **Review Validator**: Handles review submission, upvoting, flagging, and rewards
- **Anti-Spam Logic**: Prevents duplicate reviews from same wallet
- **Community Verification**: Upvote/flag mechanism for review quality

### Backend (Node.js + Express)
- **Cardano Integration**: Mesh SDK for transaction building
- **IPFS Storage**: Optional storage for images and large review data
- **DID Verification**: Simplified implementation with Atala PRISM hooks
- **Midnight Integration**: ZK proof placeholders for privacy

### Frontend Integration
- **Eternl Wallet**: Seamless wallet connection and signing
- **API Client**: Easy-to-use client for all backend endpoints

## 📁 Project Structure

```
cardano_review/
├── aiken-contracts/          # Aiken smart contracts
│   ├── validators/
│   │   └── review_validator.ak
│   ├── aiken.toml
│   └── plutus.json           # Compiled contract
├── backend/                  # Node.js API server
│   ├── services/
│   │   ├── cardano.js       # Blockchain integration
│   │   ├── wallet.js        # Wallet service
│   │   ├── ipfs.js          # IPFS integration
│   │   ├── did.js           # DID verification
│   │   └── midnight.js      # ZK proof integration
│   ├── utils/
│   │   └── hash.js          # Hashing utilities
│   ├── server.js            # Express server
│   ├── package.json
│   └── .env.example
└── frontend/                 # Frontend integration
    ├── wallet-connector.js   # Eternl wallet connector
    └── api-client.js         # API client
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Aiken compiler (installed)
- Eternl wallet browser extension
- Blockfrost API key (free at https://blockfrost.io)

### 1. Build Smart Contracts

```bash
cd aiken-contracts
aiken check
aiken build
```

This generates `plutus.json` with the compiled validator.

### 2. Configure Backend

```bash
cd backend
npm install

# Copy environment template
cp .env.example .env

# Edit .env and add your Blockfrost API key
nano .env
```

Required environment variables:
```env
NETWORK=preprod
BLOCKFROST_API_KEY=your_key_here
PORT=3000
```

### 3. Start Backend Server

```bash
npm start
# or for development with auto-reload
npm run dev
```

Server will start on http://localhost:3000

### 4. Frontend Integration

Include the frontend files in your e-commerce site:

```html
<script type="module" src="wallet-connector.js"></script>
<script type="module" src="api-client.js"></script>
```

## 📚 API Documentation

### Endpoints

#### Health Check
```
GET /health
```

#### Submit Review
```
POST /api/reviews/submit
Body: {
  walletAddress: string,
  productSku: string,
  rating: number (1-5),
  reviewText: string,
  reviewerPubKeyHash: string,
  images?: string[]
}
```

#### Get Product Reviews
```
GET /api/reviews/product/:productId
```

#### Upvote Review
```
POST /api/reviews/upvote
Body: {
  walletAddress: string,
  reviewTxHash: string,
  reviewOutputIndex: number,
  voterPubKeyHash: string
}
```

#### Verify Review
```
GET /api/reviews/verify/:txHash
```

#### Get Reputation
```
GET /api/reputation/:walletAddress
```

#### Submit Transaction
```
POST /api/transaction/submit
Body: {
  signedTxCbor: string
}
```

## 💻 Frontend Usage Example

### Connect Wallet

```javascript
import walletConnector from './wallet-connector.js';
import apiClient from './api-client.js';

// Connect to Eternl wallet
const result = await walletConnector.connect();
if (result.success) {
  console.log('Connected:', result.address);
  
  // Verify with backend
  await apiClient.connectWallet(result.address);
}
```

### Submit Review

```javascript
// 1. Prepare review data
const reviewData = {
  walletAddress: walletConnector.getAddress(),
  productSku: 'PRODUCT-123',
  rating: 5,
  reviewText: 'Excellent product!',
  reviewerPubKeyHash: await walletConnector.getPubKeyHash()
};

// 2. Build transaction via API
const response = await apiClient.submitReview(reviewData);
const { unsignedTx } = response.data;

// 3. Sign transaction with wallet
const signedTx = await walletConnector.signTransaction(unsignedTx);

// 4. Submit to blockchain
const result = await apiClient.submitTransaction(signedTx);
console.log('Review submitted! TX:', result.txHash);
console.log('View on explorer:', result.explorerUrl);
```

### Fetch Reviews

```javascript
const productId = 'generated_product_id_hash';
const reviews = await apiClient.getProductReviews(productId);

reviews.reviews.forEach(review => {
  console.log(`Rating: ${review.rating}/5`);
  console.log(`Upvotes: ${review.upvotes}`);
  console.log(`Verified: ${review.verified}`);
});
```

## 🔧 Development

### Install Dependencies

```bash
# Backend
cd backend
npm install

# Aiken (if not installed)
# Visit: https://aiken-lang.org/installation-instructions
```

### Run Tests

```bash
# Test Aiken contracts
cd aiken-contracts
aiken check

# Test backend (TODO)
cd backend
npm test
```

## 🌐 Network Configuration

### Preprod Testnet (Default)
- Network: `preprod`
- Explorer: https://preprod.cardanoscan.io
- Faucet: https://docs.cardano.org/cardano-testnet/tools/faucet

### Mainnet
- Change `NETWORK=mainnet` in `.env`
- Use mainnet Blockfrost API key
- Explorer: https://cardanoscan.io

## 🔐 Security Features

- **On-Chain Validation**: All reviews validated by smart contract
- **Signature Verification**: Transactions must be signed by reviewer
- **Anti-Spam**: Prevents duplicate reviews from same wallet
- **DID Authentication**: Decentralized identity verification
- **ZK Proofs**: Privacy-preserving duplicate detection (Midnight)

## 🎁 Reward System

Reviewers earn rewards when:
- Review receives ≥5 upvotes
- Review has ≤2 flags
- Review is marked as verified
- Reviewer claims reward via smart contract

Reward: 10 ADA (configurable in smart contract)

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

This is a hackathon project for Cardano IBW Edition 2025. Contributions welcome!

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Contact: BinaryVerse team

## 🙏 Acknowledgments

- Cardano Foundation
- IOG (Input Output Global)
- Aiken Language Team
- Mesh SDK Team
- Eternl Wallet Team

---

**Built with ❤️ for Cardano Hackathon IBW Edition 2025**
