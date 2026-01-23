import { BlockchainTransaction } from "../types";

/**
 * Cryptographic helper to hash file content client-side.
 * This ensures strict data privacy (GDPR) as the file never leaves the client 
 * in plain text for this operation.
 */
export const hashFile = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `0x${hashHex}`;
};

/**
 * Simulates a blockchain interaction (e.g., calling a Smart Contract).
 * Returns a transaction receipt after a delay.
 */
export const anchorHashOnChain = async (hash: string): Promise<BlockchainTransaction> => {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 2000));

  // In a real app, this would use ethers.js:
  // const tx = await contract.anchorDocument(hash);
  // await tx.wait();

  return {
    txHash: '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0')).join(''),
    blockNumber: 19283746,
    timestamp: Date.now(),
    status: 'CONFIRMED'
  };
};

/**
 * Generates a mock DID (Decentralized Identifier)
 */
export const generateDid = (): string => {
  const unique = Math.random().toString(36).substring(7);
  return `did:ethr:0x${unique}`;
};