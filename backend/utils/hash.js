import crypto from 'crypto';

/**
 * Generate SHA-256 hash of review content
 * @param {string} reviewText - The review text content
 * @param {number} rating - The rating (1-5)
 * @param {string} productId - The product identifier
 * @returns {string} Hex-encoded hash
 */
export function hashReviewContent(reviewText, rating, productId) {
  const content = `${productId}:${rating}:${reviewText}`;
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Generate product ID hash from product details
 * @param {string} productSku - Product SKU or identifier
 * @returns {string} Hex-encoded product ID
 */
export function generateProductId(productSku) {
  return crypto.createHash('sha256').update(productSku).digest('hex');
}

/**
 * Validate review hash
 * @param {string} hash - Hash to validate
 * @returns {boolean} True if valid hex string
 */
export function isValidHash(hash) {
  return /^[a-f0-9]{64}$/i.test(hash);
}
