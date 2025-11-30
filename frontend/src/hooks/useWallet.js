import { useState } from "react";

export default function useWallet() {
    const [wallet, setWallet] = useState(null);
    const [address, setAddress] = useState(null);
    const [balance, setBalance] = useState(null);
    const [demoMode, setDemoMode] = useState(false);

    // Connect to Eternl wallet
    const connectWallet = async () => {
        try {
            if (!window.cardano || !window.cardano.eternl) {
                alert("Eternl wallet not found! Please install it.");
                return;
            }

            const api = await window.cardano.eternl.enable();
            setWallet(api);

            // Get Bech32 address from wallet
            // getChangeAddress() returns the address in Bech32 format (addr_test1...)
            const bech32Address = await api.getChangeAddress();
            setAddress(bech32Address);

            // Get balance - parse CBOR manually
            const balanceHex = await api.getBalance();
            const ada = parseCBORBalance(balanceHex);
            setBalance(ada);

            console.log("Wallet connected - Address (Bech32):", bech32Address, "Balance:", ada, "ADA");

        } catch (err) {
            console.error("Wallet connection failed:", err);
            alert("Wallet connection failed: " + err.message);
        }
    };

    const disconnectWallet = () => {
        setWallet(null);
        setAddress(null);
        setBalance(null);
        setDemoMode(false);
    };

    return { wallet, address, balance, demoMode, connectWallet, disconnectWallet };
}

// Simple CBOR parser for Cardano balance
// The balance is encoded as: 0x82 (array of 2) + lovelace + assets
function parseCBORBalance(hex) {
    try {
        const bytes = hexToBytes(hex);

        // CBOR format: 0x82 means array of 2 items
        if (bytes[0] !== 0x82) {
            console.warn("Unexpected CBOR format, using fallback");
            return parseInt(hex, 16) / 1_000_000;
        }

        // Next byte tells us the encoding of the lovelace amount
        let pos = 1;
        let lovelace = 0;

        // Check if it's a small int (0x00-0x17) or larger
        if (bytes[pos] <= 0x17) {
            lovelace = bytes[pos];
        } else if (bytes[pos] === 0x18) {
            // 1-byte uint
            lovelace = bytes[pos + 1];
        } else if (bytes[pos] === 0x19) {
            // 2-byte uint
            lovelace = (bytes[pos + 1] << 8) | bytes[pos + 2];
        } else if (bytes[pos] === 0x1a) {
            // 4-byte uint
            lovelace = (bytes[pos + 1] << 24) | (bytes[pos + 2] << 16) | (bytes[pos + 3] << 8) | bytes[pos + 4];
        } else if (bytes[pos] === 0x1b) {
            // 8-byte uint - convert to BigInt then to Number
            let bigInt = 0n;
            for (let i = 0; i < 8; i++) {
                bigInt = (bigInt << 8n) | BigInt(bytes[pos + 1 + i]);
            }
            lovelace = Number(bigInt);
        }

        return lovelace / 1_000_000; // Convert lovelace to ADA
    } catch (err) {
        console.error("Failed to parse balance:", err);
        return 0;
    }
}

// Helper function to convert hex string to Uint8Array
function hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
}
