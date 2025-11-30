// Mock Order Database (In-Memory)
// Format: { walletAddress: [productId1, productId2, ...] }
const orders = {};

export const createOrder = async (walletAddress, productId) => {
    if (!orders[walletAddress]) {
        orders[walletAddress] = [];
    }

    // Prevent duplicate orders for demo simplicity (optional)
    if (!orders[walletAddress].includes(productId)) {
        orders[walletAddress].push(productId);
    }

    console.log(`Order created: ${walletAddress} bought ${productId}`);
    return {
        success: true,
        orderId: `ORD-${Date.now()}`,
        status: 'completed',
        timestamp: Date.now()
    };
};

export const hasPurchased = async (walletAddress, productId) => {
    if (!orders[walletAddress]) return false;
    return orders[walletAddress].includes(productId);
};

export const getUserOrders = async (walletAddress) => {
    return orders[walletAddress] || [];
};
