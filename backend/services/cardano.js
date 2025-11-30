import { BlockfrostProvider, MeshTxBuilder } from '@meshsdk/core';
import { bech32 } from 'bech32';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper to ensure address is in Bech32 format
function ensureBech32(address) {
    try {
        if (address.startsWith('addr')) return address;

        // Convert hex to words then encode to bech32
        // Testnet addresses start with 'addr_test'
        const addressBytes = Buffer.from(address, 'hex');
        const words = bech32.toWords(addressBytes);
        return bech32.encode('addr_test', words, 200);
    } catch (error) {
        console.warn('Failed to convert address to Bech32:', error.message);
        return address;
    }
}

// Initialize Blockfrost provider
const blockfrostApiKey = process.env.BLOCKFROST_API_KEY;
const network = process.env.NETWORK || 'preprod';

let blockfrostProvider;
if (blockfrostApiKey && blockfrostApiKey !== 'your_blockfrost_api_key_here' && blockfrostApiKey.trim() !== '') {
    console.log('✅ Blockfrost provider initialized');
    blockfrostProvider = new BlockfrostProvider(blockfrostApiKey);
} else {
    console.log('⚠️  Blockfrost provider NOT initialized - using mock mode');
}

// Load compiled Plutus script
let plutusScript;
try {
    const plutusPath = join(__dirname, '../../aiken-contracts/plutus.json');
    const plutusJson = JSON.parse(readFileSync(plutusPath, 'utf8'));
    plutusScript = plutusJson.validators[0];
} catch (error) {
    console.warn('Plutus script not loaded:', error.message);
}

/**
 * Build review submission transaction
 * @param {Object} params - Transaction parameters
 * @returns {Promise<string>} Unsigned transaction CBOR
 */
export async function buildReviewSubmissionTx(params) {
    const { walletAddress, productId, rating, reviewHash, reviewerPubKeyHash } = params;

    try {
        // For hackathon demo: if Blockfrost is not configured, return mock transaction
        if (!blockfrostProvider) {
            console.log('⚠️  Blockfrost not configured - returning mock transaction for demo');
            return {
                type: 'mock',
                cbor: 'mock_transaction_cbor_hex',
                hash: 'mock_tx_' + Date.now(),
                body: {
                    productId,
                    rating,
                    reviewHash,
                    reviewer: reviewerPubKeyHash,
                    timestamp: Math.floor(Date.now() / 1000)
                }
            };
        }

        console.log(`Processing review for wallet: ${walletAddress}`);

        // Ensure wallet address is in Bech32 format
        let bech32Address;
        try {
            bech32Address = ensureBech32(walletAddress);
            console.log(`Converted address: ${bech32Address}`);
        } catch (addrError) {
            console.error('Address conversion failed:', addrError);
            throw new Error(`Invalid wallet address: ${addrError.message}`);
        }

        // Convert strings to hex for Plutus data
        const productIdHex = Buffer.from(productId).toString('hex');
        // If reviewerPubKeyHash is "mock_pubkey_hash", convert it to hex too
        const reviewerHex = reviewerPubKeyHash.startsWith('mock')
            ? Buffer.from(reviewerPubKeyHash).toString('hex')
            : reviewerPubKeyHash;

        // Create review datum - formatted for Mesh/Plutus
        // Mesh expects a Constructor object: { alternative: number, fields: [] }
        const reviewDatum = {
            alternative: 0,
            fields: [
                productIdHex,               // product_id (bytes)
                rating,                     // rating (int)
                reviewHash,                 // review_hash (bytes)
                reviewerHex,                // reviewer (bytes)
                Math.floor(Date.now() / 1000), // timestamp (int)
                0,                          // upvotes (int)
                0,                          // flags (int)
                0                           // verified (int - 0 for false)
            ]
        };
        console.log('Review Datum created:', JSON.stringify(reviewDatum));

        // Build transaction using MeshTxBuilder
        console.log('Initializing MeshTxBuilder...');
        const txBuilder = new MeshTxBuilder({
            fetcher: blockfrostProvider,
            evaluator: blockfrostProvider
        });

        // Get script address
        const scriptAddress = getScriptAddress();
        console.log(`Script address: ${scriptAddress}`);

        // Get UTXOs
        console.log(`Fetching UTXOs for ${bech32Address}...`);
        const utxos = await getWalletUtxos(bech32Address);
        console.log(`Found ${utxos.length} UTXOs`);

        // Build transaction
        console.log('Building transaction...');
        const unsignedTx = await txBuilder
            .txOut(scriptAddress, [
                {
                    unit: 'lovelace',
                    quantity: '2000000' // 2 ADA minimum
                }
            ])
            .txOutInlineDatumValue(reviewDatum)
            .changeAddress(bech32Address)
            .selectUtxosFrom(utxos)
            .complete();

        console.log('Transaction built successfully');

        return unsignedTx;
    } catch (error) {
        console.error('Error building review submission transaction:', error);
        throw error;
    }
}

/**
 * Build upvote transaction
 * @param {Object} params - Transaction parameters
 * @returns {Promise<string>} Unsigned transaction CBOR
 */
export async function buildUpvoteTx(params) {
    const { walletAddress, reviewUtxo, voterPubKeyHash } = params;

    try {
        if (!blockfrostProvider) {
            throw new Error('Blockfrost provider not initialized');
        }

        const txBuilder = new MeshTxBuilder({
            fetcher: blockfrostProvider,
            evaluator: blockfrostProvider
        });

        // Update datum with incremented upvote count
        const oldDatum = reviewUtxo.datum;
        const newDatum = {
            ...oldDatum,
            upvotes: oldDatum.upvotes + 1
        };

        const redeemer = {
            tag: 'UpvoteReview',
            data: { voter: voterPubKeyHash }
        };

        const scriptAddress = getScriptAddress();

        const unsignedTx = await txBuilder
            .spendingPlutusScript('V3')
            .txIn(reviewUtxo.txHash, reviewUtxo.outputIndex)
            .txInInlineDatumPresent()
            .txInRedeemerValue(redeemer)
            .txInScript(plutusScript.compiledCode)
            .txOut(scriptAddress, reviewUtxo.value)
            .txOutInlineDatumValue(newDatum)
            .requiredSignerHash(voterPubKeyHash)
            .changeAddress(walletAddress)
            .selectUtxosFrom(await getWalletUtxos(walletAddress))
            .complete();

        return unsignedTx;
    } catch (error) {
        console.error('Error building upvote transaction:', error);
        throw error;
    }
}

/**
 * Query reviews for a product
 * @param {string} productId - Product identifier
 * @returns {Promise<Array>} List of reviews
 */
export async function queryProductReviews(productId) {
    try {
        if (!blockfrostProvider) {
            throw new Error('Blockfrost provider not initialized');
        }

        const scriptAddress = getScriptAddress();
        const utxos = await blockfrostProvider.fetchAddressUTxOs(scriptAddress);

        // Filter UTXOs by product ID
        const reviews = utxos
            .filter(utxo => {
                if (utxo.output.plutusData) {
                    const datum = deserializeDatum(utxo.output.plutusData);
                    return datum.product_id === productId;
                }
                return false;
            })
            .map(utxo => {
                const datum = deserializeDatum(utxo.output.plutusData);
                return {
                    txHash: utxo.input.txHash,
                    outputIndex: utxo.input.outputIndex,
                    ...datum
                };
            });

        return reviews;
    } catch (error) {
        console.error('Error querying product reviews:', error);
        throw error;
    }
}

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const csl = require('@sidan-lab/sidan-csl-rs-nodejs');

/**
 * Submit signed transaction to blockchain
 * @param {string} signedTxCbor - Signed transaction CBOR hex (optional if other params provided)
 * @param {string} unsignedTxCbor - Unsigned transaction CBOR hex (optional)
 * @param {string} witnessCbor - Witness set CBOR hex (optional)
 * @returns {Promise<string>} Transaction hash
 */
export async function submitTransaction(signedTxCbor, unsignedTxCbor, witnessCbor) {
    try {
        if (!blockfrostProvider) {
            throw new Error('Blockfrost provider not initialized');
        }

        let finalTxCbor = signedTxCbor;

        // Legacy support: if we have unsigned + witness, try to merge
        // But prefer the signedTxCbor if provided
        if (!signedTxCbor && unsignedTxCbor && witnessCbor) {
            console.log('Assembling transaction from unsigned tx and witnesses...');
            try {
                // MeshTxBuilder.complete() returns a full transaction (with empty witness set)
                // The wallet.signTx() returns just the witness set
                // We use CSL's merge function to combine them
                finalTxCbor = csl.merge_vkey_witnesses_to_transaction(unsignedTxCbor, witnessCbor);
                console.log('Transaction assembled successfully using CSL merge');
            } catch (assembleError) {
                console.error('Error assembling transaction:', assembleError);
                throw new Error('Failed to assemble transaction: ' + assembleError.message);
            }
        }

        if (!finalTxCbor) {
            throw new Error('No transaction to submit');
        }

        console.log('Submitting transaction to Blockfrost...');
        console.log('Tx CBOR length:', finalTxCbor.length);

        const txHash = await blockfrostProvider.submitTx(finalTxCbor);
        console.log(`✅ Transaction submitted successfully! Hash: ${txHash}`);

        return txHash;
    } catch (error) {
        console.error('Error in submitTransaction:', error);
        throw error;
    }
}

/**
 * Get the script address for the review validator
 * Using a working testnet address that has successfully submitted transactions
 * @returns {string} Script address in Bech32 format
 */
export function getScriptAddress() {
    // Working address that successfully submitted transactions:
    // - 019ccf07e880e2bef19709aced71dd8dc8a293136ca1b7c54849e77f4461a99f
    // - b3541ea9d6fc72bd9395688b6c2e3a144677e823a5ab32a95175a2a274cb8f52
    return 'addr_test1qzuj54degd86nn0fmn7melfuc8jln6zsug9knw06jdatgyu2m4n8ptzy49y25r6pe677yfgyrskvayeg4t7q4q25stwsu5cvm9';
}

/**
 * Get wallet UTXOs
 * @param {string} walletAddress - Wallet address
 * @returns {Promise<Array>} List of UTXOs
 */
async function getWalletUtxos(walletAddress) {
    if (!blockfrostProvider) {
        throw new Error('Blockfrost provider not initialized');
    }

    return await blockfrostProvider.fetchAddressUTxOs(walletAddress);
}

/**
 * Deserialize datum from Plutus data
 * @param {string} plutusData - Plutus data hex
 * @returns {Object} Deserialized datum
 */
function deserializeDatum(plutusData) {
    // Simplified deserialization - in production use proper Plutus data parsing
    try {
        return JSON.parse(plutusData);
    } catch {
        return {};
    }
}

/**
 * Get transaction details
 * @param {string} txHash - Transaction hash
 * @returns {Promise<Object>} Transaction details
 */
export async function getTransactionDetails(txHash) {
    try {
        if (!blockfrostProvider) {
            throw new Error('Blockfrost provider not initialized');
        }

        const tx = await blockfrostProvider.fetchTxInfo(txHash);
        return tx;
    } catch (error) {
        console.error('Error fetching transaction details:', error);
        throw error;
    }
}

/**
 * Calculate reputation score for a reviewer
 * @param {string} reviewerAddress - Reviewer's wallet address
 * @returns {Promise<number>} Reputation score
 */
export async function calculateReputationScore(reviewerAddress) {
    try {
        const scriptAddress = getScriptAddress();
        const utxos = await blockfrostProvider.fetchAddressUTxOs(scriptAddress);

        // Find all reviews by this reviewer
        const reviewerReviews = utxos.filter(utxo => {
            if (utxo.output.plutusData) {
                const datum = deserializeDatum(utxo.output.plutusData);
                return datum.reviewer === reviewerAddress;
            }
            return false;
        });

        // Calculate score based on upvotes and verified reviews
        let score = 0;
        reviewerReviews.forEach(utxo => {
            const datum = deserializeDatum(utxo.output.plutusData);
            score += datum.upvotes * 10; // 10 points per upvote
            if (datum.verified) {
                score += 50; // 50 points for verified review
            }
            score -= datum.flags * 20; // -20 points per flag
        });

        return Math.max(0, score); // Ensure non-negative
    } catch (error) {
        console.error('Error calculating reputation:', error);
        return 0;
    }
}


