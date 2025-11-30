// Mock Product Database
const PRODUCTS = [
    {
        id: 'IPHONE-15-PRO',
        sku: 'IPHONE-15-PRO',
        name: 'iPhone 15 Pro',
        price: 999,
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800',
        rating: 4.8,
        reviews: 128,
        description: 'The first iPhone to feature an aerospace-grade titanium design, using the same alloy that spacecraft use for missions to Mars.'
    },
    {
        id: 'MACBOOK-PRO-M3',
        sku: 'MACBOOK-PRO-M3',
        name: 'MacBook Pro M3',
        price: 1599,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&q=80&w=800',
        rating: 4.9,
        reviews: 85,
        description: 'Mind-blowing. Head-turning. With the M3 family of chips, MacBook Pro becomes even more capable and efficient.'
    },
    {
        id: 'SONY-WH1000XM5',
        sku: 'SONY-WH1000XM5',
        name: 'Sony WH-1000XM5',
        price: 348,
        image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800',
        rating: 4.7,
        reviews: 243,
        description: 'Industry-leading noise cancellation with two processors controlling 8 microphones.'
    },
    {
        id: 'PS5-SLIM',
        sku: 'PS5-SLIM',
        name: 'PlayStation 5 Slim',
        price: 449,
        image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=800',
        rating: 4.9,
        reviews: 312,
        description: 'Experience lightning fast loading with an ultra-high speed SSD, deeper immersion with haptic feedback.'
    }
];

export const getAllProducts = async () => {
    return PRODUCTS;
};

export const getProductById = async (id) => {
    return PRODUCTS.find(p => p.id === id || p.sku === id);
};
