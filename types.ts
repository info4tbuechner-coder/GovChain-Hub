
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
  action: 'LOGIN' | 'VIEW_DOC' | 'ANCHOR_HASH' | 'VERIFY_CREDENTIAL' | 'ISSUE_CREDENTIAL' | 'CAST_VOTE' | 'SIGN_DOCUMENT' | 'TRANSFER_ASSET' | 'SUBMIT_BID' | 'TRANSFER_FUNDS';
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
  type: 'IdentityCard' | 'DriverLicense' | 'EmployeeBadge';
  holderName: string; // In real SSI, this is inside the encrypted VC
  holderDid: string; // Decentralized Identifier
  issuerDid: string;
  credentialHash: string; // The root hash stored on-chain
  claims: Record<string, string>; // The actual data (e.g. "License Class: B")
  issuanceDate: Date;
  expirationDate?: Date;
  revocationStatus: boolean;
}

/**
 * Voting Proposal (DAO style governance)
 */
export interface Proposal {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'ACTIVE' | 'CLOSED' | 'PENDING';
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  totalVoters: number;
}

/**
 * Workflow Task for Digital Signatures (E-Akte)
 */
export interface WorkflowTask {
  id: string;
  title: string;
  type: 'PROCUREMENT' | 'LEGAL' | 'HR' | 'MEMO';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'SIGNED' | 'REJECTED';
  requester: string;
  createdAt: Date;
  documentRef: string; // In real app: URL to PDF
  signedAt?: Date;
  signatureHash?: string;
}

// ---------------------------------------------------------
// INFRASTRUCTURE TYPES
// ---------------------------------------------------------

export interface Block {
  height: number;
  hash: string;
  timestamp: Date;
  proposer: string; // e.g., "Validator-BMI-01"
  txCount: number;
  size: number; // in KB
}

export interface NetworkNode {
  id: string;
  name: string;
  organization: string; // e.g. "Bundesdruckerei", "BSI"
  status: 'ACTIVE' | 'SYNCING' | 'OFFLINE';
  latency: number; // ms
  peers: number;
  version: string;
  role: 'VALIDATOR' | 'OBSERVER';
}

// ---------------------------------------------------------
// REGISTRY TYPES
// ---------------------------------------------------------

export interface AssetHistoryEvent {
  id: string;
  date: Date;
  type: 'REGISTRATION' | 'TRANSFER' | 'INSPECTION' | 'MODIFICATION';
  description: string;
  actor: string; // The authority or person acting
  txHash: string;
}

export interface RegistryAsset {
  id: string; // Unique ID (e.g. VIN)
  type: 'VEHICLE' | 'REAL_ESTATE';
  title: string;
  currentOwner: string;
  status: 'ACTIVE' | 'LOCKED' | 'ARCHIVED';
  specs: Record<string, string>;
  history: AssetHistoryEvent[];
  contractAddress: string;
  tokenId: string;
}

// ---------------------------------------------------------
// PROCUREMENT TYPES
// ---------------------------------------------------------

export interface TenderBid {
  id: string;
  timestamp: Date;
  bidderHash: string; // Pseudonymized bidder ID
  offerHash: string; // Hash of the PDF/Offer
  status: 'SEALED' | 'REVEALED';
  amount?: number; // Only visible after reveal
}

export interface Tender {
  id: string;
  refNumber: string;
  title: string;
  description: string;
  budget: string;
  deadline: Date;
  status: 'OPEN' | 'REVIEW' | 'AWARDED';
  contractAddress: string;
  bids: TenderBid[];
}

// ---------------------------------------------------------
// FINANCE / BUDGET TYPES
// ---------------------------------------------------------

export interface TokenTransaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  currency: 'eEUR' | 'GRANT-IT' | 'GRANT-SOCIAL';
  timestamp: Date;
  status: 'COMPLETED' | 'PENDING' | 'LOCKED';
  smartRule?: string; // e.g., "4-EYES", "EXPIRATION-2025"
  txHash: string;
}

export interface BudgetAccount {
  id: string;
  name: string;
  type: 'MAIN' | 'PROJECT' | 'ESCROW';
  balance: number;
  currency: 'eEUR' | 'GRANT-IT' | 'GRANT-SOCIAL';
  address: string; // Blockchain address
  restrictions: string[]; // e.g. ["No-Cash-Out", "Vendor-Whitelist-Only"]
}

// ---------------------------------------------------------
// COMPLIANCE TYPES (New)
// ---------------------------------------------------------

export interface ComplianceAlert {
  id: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: 'INTEGRITY' | 'ACCESS' | 'SMART_CONTRACT' | 'GDPR';
  message: string;
  timestamp: Date;
  relatedLogId?: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
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

export interface UserNotification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  timestamp: Date;
  read: boolean;
  linkTo?: string; // View ID to navigate to
}