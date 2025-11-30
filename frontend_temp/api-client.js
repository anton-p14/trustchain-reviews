/**
 * API Client for TrustChain Reviews
 * Frontend client for communicating with the backend API
 */

const API_BASE_URL = 'http://localhost:3000/api';

class TrustChainAPI {
    /**
     * Submit a review
     * @param {Object} reviewData - Review data
     * @returns {Promise<Object>}
     */
    async submitReview(reviewData) {
        try {
            const response = await fetch(`${API_BASE_URL}/reviews/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reviewData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit review');
            }

            return data;
        } catch (error) {
            console.error('Error submitting review:', error);
            throw error;
        }
    }

    /**
     * Get reviews for a product
     * @param {string} productId - Product identifier
     * @returns {Promise<Object>}
     */
    async getProductReviews(productId) {
        try {
            const response = await fetch(`${API_BASE_URL}/reviews/product/${productId}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch reviews');
            }

            return data;
        } catch (error) {
            console.error('Error fetching reviews:', error);
            throw error;
        }
    }

    /**
     * Upvote a review
     * @param {Object} upvoteData - Upvote data
     * @returns {Promise<Object>}
     */
    async upvoteReview(upvoteData) {
        try {
            const response = await fetch(`${API_BASE_URL}/reviews/upvote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(upvoteData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to upvote review');
            }

            return data;
        } catch (error) {
            console.error('Error upvoting review:', error);
            throw error;
        }
    }

    /**
     * Verify a review on blockchain
     * @param {string} txHash - Transaction hash
     * @returns {Promise<Object>}
     */
    async verifyReview(txHash) {
        try {
            const response = await fetch(`${API_BASE_URL}/reviews/verify/${txHash}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to verify review');
            }

            return data;
        } catch (error) {
            console.error('Error verifying review:', error);
            throw error;
        }
    }

    /**
     * Get reviewer reputation
     * @param {string} walletAddress - Wallet address
     * @returns {Promise<Object>}
     */
    async getReputation(walletAddress) {
        try {
            const response = await fetch(`${API_BASE_URL}/reputation/${walletAddress}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch reputation');
            }

            return data;
        } catch (error) {
            console.error('Error fetching reputation:', error);
            throw error;
        }
    }

    /**
     * Submit signed transaction to blockchain
     * @param {string} signedTxCbor - Signed transaction CBOR
     * @returns {Promise<Object>}
     */
    async submitTransaction(signedTxCbor) {
        try {
            const response = await fetch(`${API_BASE_URL}/transaction/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ signedTxCbor })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit transaction');
            }

            return data;
        } catch (error) {
            console.error('Error submitting transaction:', error);
            throw error;
        }
    }

    /**
     * Connect wallet (server-side validation)
     * @param {string} walletAddress - Wallet address
     * @returns {Promise<Object>}
     */
    async connectWallet(walletAddress) {
        try {
            const response = await fetch(`${API_BASE_URL}/wallet/connect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ walletAddress })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to connect wallet');
            }

            return data;
        } catch (error) {
            console.error('Error connecting wallet:', error);
            throw error;
        }
    }

    /**
     * Get IPFS content
     * @param {string} cid - IPFS Content Identifier
     * @returns {Promise<Object>}
     */
    async getIPFSContent(cid) {
        try {
            const response = await fetch(`${API_BASE_URL}/ipfs/${cid}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch IPFS content');
            }

            return data;
        } catch (error) {
            console.error('Error fetching IPFS content:', error);
            throw error;
        }
    }

    /**
     * Check API health
     * @returns {Promise<Object>}
     */
    async checkHealth() {
        try {
            const response = await fetch('http://localhost:3000/health');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error checking API health:', error);
            throw error;
        }
    }
}

// Export singleton instance
const apiClient = new TrustChainAPI();

// Make available globally
if (typeof window !== 'undefined') {
    window.TrustChainAPI = apiClient;
}

export default apiClient;
