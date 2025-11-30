import { create } from 'kubo-rpc-client';
import dotenv from 'dotenv';

dotenv.config();

// Initialize IPFS client
const ipfs = create({
    host: process.env.IPFS_HOST || '127.0.0.1',
    port: process.env.IPFS_PORT || 5001,
    protocol: process.env.IPFS_PROTOCOL || 'http'
});

/**
 * Upload review content to IPFS
 * @param {Object} reviewData - Review data to upload
 * @returns {Promise<string>} IPFS CID
 */
export async function uploadToIPFS(reviewData) {
    try {
        const content = JSON.stringify(reviewData);
        const { cid } = await ipfs.add(content);
        console.log(`Uploaded to IPFS: ${cid.toString()}`);
        return cid.toString();
    } catch (error) {
        console.error('IPFS upload error:', error);
        throw new Error('Failed to upload to IPFS');
    }
}

/**
 * Retrieve content from IPFS
 * @param {string} cid - IPFS Content Identifier
 * @returns {Promise<Object>} Retrieved content
 */
export async function getFromIPFS(cid) {
    try {
        const chunks = [];
        for await (const chunk of ipfs.cat(cid)) {
            chunks.push(chunk);
        }
        const content = Buffer.concat(chunks).toString();
        return JSON.parse(content);
    } catch (error) {
        console.error('IPFS retrieval error:', error);
        throw new Error('Failed to retrieve from IPFS');
    }
}

/**
 * Upload image to IPFS
 * @param {Buffer} imageBuffer - Image buffer
 * @returns {Promise<string>} IPFS CID
 */
export async function uploadImageToIPFS(imageBuffer) {
    try {
        const { cid } = await ipfs.add(imageBuffer);
        console.log(`Image uploaded to IPFS: ${cid.toString()}`);
        return cid.toString();
    } catch (error) {
        console.error('IPFS image upload error:', error);
        throw new Error('Failed to upload image to IPFS');
    }
}

/**
 * Check if IPFS is available
 * @returns {Promise<boolean>} True if IPFS is available
 */
export async function isIPFSAvailable() {
    try {
        await ipfs.id();
        return true;
    } catch (error) {
        console.error('IPFS not available:', error.message);
        return false;
    }
}
