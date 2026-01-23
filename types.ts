// ---------------------------------------------------------
// DATABASE SCHEMA REPRESENTATION (Virtual Prisma Schema)
// ---------------------------------------------------------

/**
 * User Roles within the Government context
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER'
}

/**
 * Status of a Document in the Secure Transfer workflow
 */
export enum DocStatus {
  UPLOADED = 'UPLOADED',
  HASHING = 'HASHING',
  ANCHORED = 'ANCHORED', // Timestamped on Blockchain
  VERIFIED = 'VERIFIED'
}

/**
 * Represents a Government Official or System User
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  createdAt: Date;
}

/**
 * Knowledge Base Article
 */
export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  authorId: string;
  published: boolean;
  tags: string[];
  updatedAt: Date;
}

/**
 * Technical Instrument/Tool Definition
 */
export interface Instrument {
  id: string;
  name: string; // e.g., "Bürger-Wallet"
  type: 'SSI' | 'NOTARIZATION' | 'TOKEN' | 'VOTING';
  description: string;
  maturityLevel: 'PILOT' | 'PRODUCTION' | 'DEPRECATED';
  technicalSpecs: Record<string, string>; // JSON in DB
}

/**
 * Compliance & Security Log
 * Immutable record of actions.
 */
export interface AuditLog {
  id: string;
  userId: string; // Who performed the action
  action: 'LOGIN' | 'VIEW_DOC' | 'ANCHOR_HASH' | 'VERIFY_CREDENTIAL';
  resourceId?: string;
  metadata?: string; // JSON string of details
  timestamp: Date;
  ipHash: string; // Anonymized IP
}

/**
 * Verifiable Credential Metadata
 * Stores ONLY the hash and metadata, no PII.
 */
export interface VerifiableCredential {
  id: string;
  holderDid: string; // Decentralized Identifier
  issuerDid: string;
  credentialHash: string; // The root hash stored on-chain
  issuanceDate: Date;
  expirationDate?: Date;
  revocationStatus: boolean;
}

// ---------------------------------------------------------
// APP STATE TYPES
// ---------------------------------------------------------

export interface BlockchainTransaction {
  txHash: string;
  blockNumber: number;
  timestamp: number;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
}

export interface SecurityChecklistItem {
  id: string;
  category: 'INFRA' | 'APP' | 'DATA';
  label: string;
  description: string;
  critical: boolean;
}