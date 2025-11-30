import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { hashReviewContent, generateProductId } from './utils/hash.js';
import { uploadToIPFS, getFromIPFS, isIPFSAvailable } from './services/ipfs.js';
import { verifyDID, getDIDInfo, updateReputation } from './services/did.js';
import { generateUniquenessProof, verifyUniquenessProof, checkDuplicateReview } from './services/midnight.js';
import {
    buildReviewSubmissionTx,
    buildUpvoteTx,
    queryProductReviews,
    submitTransaction,
    getTransactionDetails,
    calculateReputationScore
} from './services/cardano.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for reviews (for demo - in production use a database)
const reviewsStore = new Map(); // productId -> array of review objects


// Root endpoint
app.get('/', (req, res) => {
    res.send(`
    <h1>TrustChain Reviews API</h1>
    <p>Server is running correctly.</p>
    <p>Frontend is running at <a href="http://localhost:5173">http://localhost:5173</a></p>
    <p>API Health: <a href="/health">/health</a></p>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'TrustChain Reviews API',
        version: '1.0.0',
        network: process.env.NETWORK || 'preprod'
    });
});

// Get reviews for a product
app.get('/api/reviews/product/:productId', async (req, res) => {
    try {
        const { productId } = req.params;

        console.log(`Fetching reviews for product: ${productId}`);

        // Get reviews from in-memory store
        const storedReviews = reviewsStore.get(productId) || [];

        // Fetch full review data from IPFS for each review
        const reviews = await Promise.all(
            storedReviews.map(async (review) => {
                if (review.ipfsCid) {
                    try {
                        const ipfsData = await getFromIPFS(review.ipfsCid);
                        return {
                            ...review,
                            ...ipfsData
                        };
                    } catch (error) {
                        console.error(`Failed to fetch from IPFS: ${review.ipfsCid}`, error);
                        return review; // Return stored data if IPFS fetch fails
                    }
                }
                return review;
            })
        );

        res.json({
            success: true,
            productId,
            count: reviews.length,
            reviews
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

import { getAllProducts, getProductById } from './services/products.js';
import { createOrder, hasPurchased } from './services/orders.js';

// ... (imports remain same)

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await getAllProducts();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create an order (Buy)
app.post('/api/orders', async (req, res) => {
    try {
        const { walletAddress, productId } = req.body;
        if (!walletAddress || !productId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const order = await createOrder(walletAddress, productId);
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Submit a new review
app.post('/api/reviews/submit', async (req, res) => {
    try {
        const {
            walletAddress,
            productSku,
            rating,
            reviewText,
            reviewerPubKeyHash,
            images
        } = req.body;

        // Debug: Log what we received
        console.log("Review submission request body:", JSON.stringify(req.body, null, 2));
        console.log("Rating type:", typeof rating, "Value:", rating);

        // Validate input
        if (!walletAddress || !productSku || !rating || !reviewText) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // 1. VERIFY PURCHASE (New Logic)
        const purchased = await hasPurchased(walletAddress, productSku);
        if (!purchased) {
            return res.status(403).json({
                success: false,
                error: 'Verified Purchase Required: You must buy this product before reviewing it.'
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                error: 'Rating must be between 1 and 5'
            });
        }

        console.log(`Submitting review for product: ${productSku}`);

        // Generate product ID
        const productId = generateProductId(productSku);

        // Check for duplicate review using Midnight ZK proofs
        const isDuplicate = await checkDuplicateReview(walletAddress, productId);
        if (isDuplicate) {
            return res.status(400).json({
                success: false,
                error: 'You have already reviewed this product'
            });
        }

        // Verify user DID
        const didVerification = await verifyDID(walletAddress);
        if (!didVerification.success) {
            return res.status(400).json({
                success: false,
                error: 'DID verification failed'
            });
        }

        // Generate ZK proof for uniqueness
        const zkProof = await generateUniquenessProof(walletAddress);
        if (!zkProof.success) {
            return res.status(400).json({
                success: false,
                error: 'Failed to generate uniqueness proof'
            });
        }

        // Hash review content
        const reviewHash = hashReviewContent(reviewText, rating, productId);

        // Upload review content to IPFS
        let ipfsCid = null;
        const ipfsAvailable = await isIPFSAvailable();
        if (ipfsAvailable) {
            const reviewData = {
                productSku,
                rating,
                reviewText,
                timestamp: Date.now(),
                images: images || [],
                verifiedPurchase: true // Add this flag
            };
            ipfsCid = await uploadToIPFS(reviewData);
        }

        // Build transaction
        const unsignedTx = await buildReviewSubmissionTx({
            walletAddress,
            productId,
            rating,
            reviewHash,
            reviewerPubKeyHash: reviewerPubKeyHash || 'mock_pubkey_hash' // Allow mock for now if missing
        });

        // Store review in memory for persistence
        const reviewRecord = {
            id: Date.now().toString(),
            productId: productSku, // Use SKU for easier retrieval
            productSku,
            rating,
            reviewText,
            walletAddress,
            ipfsCid,
            reviewHash,
            timestamp: Date.now(),
            verified: true
        };

        // Store using SKU (not hashed productId) so frontend can fetch easily
        if (!reviewsStore.has(productSku)) {
            reviewsStore.set(productSku, []);
        }
        reviewsStore.get(productSku).push(reviewRecord);
        console.log(`✅ Review stored in memory for product ${productSku}`);

        res.json({
            success: true,
            message: 'Review transaction built successfully',
            data: {
                unsignedTx,
                productId,
                reviewHash,
                ipfsCid,
                zkProof: zkProof.proof
            }
        });
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Upvote a review
app.post('/api/reviews/upvote', async (req, res) => {
    try {
        const { walletAddress, reviewTxHash, reviewOutputIndex, voterPubKeyHash } = req.body;

        if (!walletAddress || !reviewTxHash || reviewOutputIndex === undefined || !voterPubKeyHash) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        console.log(`Upvoting review: ${reviewTxHash}#${reviewOutputIndex}`);

        // Build upvote transaction
        const reviewUtxo = {
            txHash: reviewTxHash,
            outputIndex: reviewOutputIndex,
            // In production, fetch actual UTXO data from blockchain
            datum: {}, // Placeholder
            value: []
        };

        const unsignedTx = await buildUpvoteTx({
            walletAddress,
            reviewUtxo,
            voterPubKeyHash
        });

        res.json({
            success: true,
            message: 'Upvote transaction built successfully',
            data: {
                unsignedTx
            }
        });
    } catch (error) {
        console.error('Error upvoting review:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Verify review on blockchain
app.get('/api/reviews/verify/:txHash', async (req, res) => {
    try {
        const { txHash } = req.params;

        console.log(`Verifying review transaction: ${txHash}`);
        const txDetails = await getTransactionDetails(txHash);

        res.json({
            success: true,
            verified: true,
            transaction: txDetails,
            explorerUrl: `https://preprod.cardanoscan.io/transaction/${txHash}`
        });
    } catch (error) {
        console.error('Error verifying review:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get reviewer reputation
app.get('/api/reputation/:walletAddress', async (req, res) => {
    try {
        const { walletAddress } = req.params;

        console.log(`Fetching reputation for: ${walletAddress}`);

        const didInfo = getDIDInfo(walletAddress);
        const reputationScore = await calculateReputationScore(walletAddress);

        res.json({
            success: true,
            walletAddress,
            reputation: reputationScore,
            did: didInfo?.did,
            verified: didInfo?.verified || false
        });
    } catch (error) {
        console.error('Error fetching reputation:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Submit signed transaction
app.post('/api/transaction/submit', async (req, res) => {
    try {
        const { signedTxCbor, unsignedTxCbor, witnessCbor } = req.body;

        // Support both old (signedTxCbor) and new (unsigned + witness) formats
        if (!signedTxCbor && (!unsignedTxCbor || !witnessCbor)) {
            return res.status(400).json({
                success: false,
                error: 'Missing transaction data (signedTxCbor OR unsignedTxCbor + witnessCbor)'
            });
        }

        console.log('Submitting transaction to blockchain');
        const txHash = await submitTransaction(signedTxCbor, unsignedTxCbor, witnessCbor);

        res.json({
            success: true,
            txHash,
            explorerUrl: `https://preprod.cardanoscan.io/transaction/${txHash}`
        });
    } catch (error) {
        console.error('Error submitting transaction:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get IPFS content
app.get('/api/ipfs/:cid', async (req, res) => {
    try {
        const { cid } = req.params;

        console.log(`Fetching IPFS content: ${cid}`);
        const content = await getFromIPFS(cid);

        res.json({
            success: true,
            content
        });
    } catch (error) {
        console.error('Error fetching IPFS content:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Wallet connection endpoint (for server-side validation)
app.post('/api/wallet/connect', async (req, res) => {
    try {
        const { walletAddress } = req.body;

        if (!walletAddress) {
            return res.status(400).json({
                success: false,
                error: 'Wallet address required'
            });
        }

        // Verify DID
        const didVerification = await verifyDID(walletAddress);

        res.json({
            success: true,
            walletAddress,
            did: didVerification.did,
            verified: didVerification.verified
        });
    } catch (error) {
        console.error('Error connecting wallet:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   TrustChain Reviews API Server                          ║
║   Cardano Blockchain Review Platform                     ║
║                                                           ║
║   Server running on: http://localhost:${PORT}              ║
║   Network: ${process.env.NETWORK || 'preprod'}                                      ║
║                                                           ║
║   Endpoints:                                              ║
║   - GET  /health                                          ║
║   - GET  /api/reviews/product/:productId                  ║
║   - POST /api/reviews/submit                              ║
║   - POST /api/reviews/upvote                              ║
║   - GET  /api/reviews/verify/:txHash                      ║
║   - GET  /api/reputation/:walletAddress                   ║
║   - POST /api/transaction/submit                          ║
║   - GET  /api/ipfs/:cid                                   ║
║   - POST /api/wallet/connect                              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;
