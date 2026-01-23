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
 * Verifies if a file matches a given blockchain transaction or hash.
 * In a real scenario, this would fetch the tx input data from the chain.
 */
export const verifyDocumentOnChain = async (fileHash: string, txHash: string): Promise<{ valid: boolean; timestamp?: number; issuer?: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock validation logic: 
  // If the hash starts with '0x' it's considered valid for this demo.
  // In reality: Check if SmartContract.mapping(fileHash) exists.
  
  if (fileHash && txHash.startsWith('0x')) {
      return {
          valid: true,
          timestamp: Date.now() - 86400000, // Mock timestamp (yesterday)
          issuer: 'did:web:bundesdruckerei.de'
      };
  }
  return { valid: false };
};

/**
 * Generates a mock DID (Decentralized Identifier)
 */
export const generateDid = (): string => {
  const unique = Math.random().toString(36).substring(7);
  return `did:ethr:0x${unique}`;
};