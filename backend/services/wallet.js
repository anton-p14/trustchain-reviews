/**
 * Wallet connection and management service
 * Handles Eternl wallet integration on the client side
 */

export class WalletService {
    constructor() {
        this.connectedWallet = null;
        this.walletAddress = null;
    }

    /**
     * Check if Eternl wallet is available
     * @returns {boolean} True if Eternl is installed
     */
    isEternlAvailable() {
        return typeof window !== 'undefined' && window.cardano && window.cardano.eternl;
    }

    /**
     * Connect to Eternl wallet
     * @returns {Promise<Object>} Connection result with wallet info
     */
    async connectEternl() {
        try {
            if (!this.isEternlAvailable()) {
                throw new Error('Eternl wallet not found. Please install Eternl wallet extension.');
            }

            const eternl = window.cardano.eternl;
            const api = await eternl.enable();

            // Get wallet address
            const addresses = await api.getUsedAddresses();
            const address = addresses[0];

            // Get network ID
            const networkId = await api.getNetworkId();

            this.connectedWallet = api;
            this.walletAddress = address;

            console.log('Connected to Eternl wallet:', address);

            return {
                success: true,
                address,
                networkId,
                walletName: 'Eternl'
            };
        } catch (error) {
            console.error('Wallet connection error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get wallet balance
     * @returns {Promise<string>} Balance in lovelace
     */
    async getBalance() {
        if (!this.connectedWallet) {
            throw new Error('Wallet not connected');
        }

        try {
            const balance = await this.connectedWallet.getBalance();
            return balance;
        } catch (error) {
            console.error('Error getting balance:', error);
            throw error;
        }
    }

    /**
     * Get wallet UTXOs
     * @returns {Promise<Array>} List of UTXOs
     */
    async getUTXOs() {
        if (!this.connectedWallet) {
            throw new Error('Wallet not connected');
        }

        try {
            const utxos = await this.connectedWallet.getUtxos();
            return utxos;
        } catch (error) {
            console.error('Error getting UTXOs:', error);
            throw error;
        }
    }

    /**
     * Sign transaction
     * @param {string} txCbor - Transaction CBOR hex
     * @returns {Promise<string>} Signed transaction
     */
    async signTransaction(txCbor) {
        if (!this.connectedWallet) {
            throw new Error('Wallet not connected');
        }

        try {
            const signedTx = await this.connectedWallet.signTx(txCbor, true);
            return signedTx;
        } catch (error) {
            console.error('Error signing transaction:', error);
            throw error;
        }
    }

    /**
     * Submit signed transaction
     * @param {string} signedTxCbor - Signed transaction CBOR
     * @returns {Promise<string>} Transaction hash
     */
    async submitTransaction(signedTxCbor) {
        if (!this.connectedWallet) {
            throw new Error('Wallet not connected');
        }

        try {
            const txHash = await this.connectedWallet.submitTx(signedTxCbor);
            return txHash;
        } catch (error) {
            console.error('Error submitting transaction:', error);
            throw error;
        }
    }

    /**
     * Disconnect wallet
     */
    disconnect() {
        this.connectedWallet = null;
        this.walletAddress = null;
        console.log('Wallet disconnected');
    }

    /**
     * Get current wallet address
     * @returns {string|null} Wallet address
     */
    getAddress() {
        return this.walletAddress;
    }

    /**
     * Check if wallet is connected
     * @returns {boolean} True if connected
     */
    isConnected() {
        return this.connectedWallet !== null;
    }
}

// Export singleton instance for server-side reference
export const walletService = new WalletService();
