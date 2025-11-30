/**
 * Eternl Wallet Connector for Frontend
 * Client-side wallet integration for TrustChain Reviews
 */

class EternlWalletConnector {
    constructor() {
        this.wallet = null;
        this.address = null;
        this.networkId = null;
    }

    /**
     * Check if Eternl wallet is installed
     * @returns {boolean}
     */
    isInstalled() {
        return typeof window !== 'undefined' && window.cardano && window.cardano.eternl;
    }

    /**
     * Connect to Eternl wallet
     * @returns {Promise<Object>}
     */
    async connect() {
        try {
            if (!this.isInstalled()) {
                throw new Error('Eternl wallet not found. Please install from https://eternl.io');
            }

            const eternl = window.cardano.eternl;

            // Request wallet access
            const api = await eternl.enable();
            this.wallet = api;

            // Get wallet address
            const addresses = await api.getUsedAddresses();
            if (addresses.length === 0) {
                const unusedAddresses = await api.getUnusedAddresses();
                this.address = unusedAddresses[0];
            } else {
                this.address = addresses[0];
            }

            // Get network ID
            this.networkId = await api.getNetworkId();

            console.log('✅ Connected to Eternl wallet');
            console.log('Address:', this.address);
            console.log('Network:', this.networkId === 0 ? 'Testnet' : 'Mainnet');

            return {
                success: true,
                address: this.address,
                networkId: this.networkId
            };
        } catch (error) {
            console.error('❌ Wallet connection failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get wallet balance
     * @returns {Promise<string>}
     */
    async getBalance() {
        if (!this.wallet) {
            throw new Error('Wallet not connected');
        }

        const balance = await this.wallet.getBalance();
        return balance;
    }

    /**
     * Get wallet UTXOs
     * @returns {Promise<Array>}
     */
    async getUTXOs() {
        if (!this.wallet) {
            throw new Error('Wallet not connected');
        }

        const utxos = await this.wallet.getUtxos();
        return utxos;
    }

    /**
     * Sign transaction
     * @param {string} txCbor - Unsigned transaction CBOR
     * @returns {Promise<string>} Signed transaction CBOR
     */
    async signTransaction(txCbor) {
        if (!this.wallet) {
            throw new Error('Wallet not connected');
        }

        try {
            console.log('📝 Signing transaction...');
            const signedTx = await this.wallet.signTx(txCbor, true);
            console.log('✅ Transaction signed');
            return signedTx;
        } catch (error) {
            console.error('❌ Transaction signing failed:', error);
            throw error;
        }
    }

    /**
     * Submit signed transaction
     * @param {string} signedTxCbor - Signed transaction CBOR
     * @returns {Promise<string>} Transaction hash
     */
    async submitTransaction(signedTxCbor) {
        if (!this.wallet) {
            throw new Error('Wallet not connected');
        }

        try {
            console.log('📤 Submitting transaction...');
            const txHash = await this.wallet.submitTx(signedTxCbor);
            console.log('✅ Transaction submitted:', txHash);
            return txHash;
        } catch (error) {
            console.error('❌ Transaction submission failed:', error);
            throw error;
        }
    }

    /**
     * Get public key hash from address
     * @returns {Promise<string>}
     */
    async getPubKeyHash() {
        if (!this.address) {
            throw new Error('Wallet not connected');
        }

        // Extract pub key hash from address
        // In production, use proper Cardano serialization library
        return this.address.slice(0, 56); // Simplified
    }

    /**
     * Disconnect wallet
     */
    disconnect() {
        this.wallet = null;
        this.address = null;
        this.networkId = null;
        console.log('👋 Wallet disconnected');
    }

    /**
     * Check if wallet is connected
     * @returns {boolean}
     */
    isConnected() {
        return this.wallet !== null;
    }

    /**
     * Get current address
     * @returns {string|null}
     */
    getAddress() {
        return this.address;
    }
}

// Export singleton instance
const walletConnector = new EternlWalletConnector();

// Make available globally
if (typeof window !== 'undefined') {
    window.TrustChainWallet = walletConnector;
}

export default walletConnector;
