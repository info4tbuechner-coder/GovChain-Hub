import { Article, AuditLog, Instrument, User, UserRole, VerifiableCredential } from '../types';

/**
 * Mock Data Store - Simulating PostgreSQL
 */
const MOCK_USERS: User[] = [
  {
    id: 'u-1',
    email: 'admin@digital.bund.de',
    name: 'Dr. Erika Mustermann',
    role: UserRole.ADMIN,
    department: 'IT-Sicherheit / BMI',
    createdAt: new Date('2024-01-01')
  }
];

const MOCK_ARTICLES: Article[] = [
  {
    id: 'a-1',
    title: 'Grundlagen der Self-Sovereign Identity (SSI)',
    slug: 'ssi-basics',
    summary: 'Wie dezentrale Identitäten die Datensouveränität der Bürger stärken.',
    content: 'SSI ermöglicht es Bürgern, ihre Identitätsdaten in einer Wallet auf ihrem Smartphone zu speichern...',
    authorId: 'u-1',
    published: true,
    tags: ['Identity', 'Wallet', 'Datenschutz'],
    updatedAt: new Date('2025-02-10')
  },
  {
    id: 'a-2',
    title: 'Blockchain-Notarisierung von Verwaltungsakten',
    slug: 'doc-notarization',
    summary: 'Einsatz von Hash-Bäumen zur manipulationssicheren Archivierung.',
    content: 'Durch das Hashing von Dokumenten und die Verankerung des Root-Hash auf einer öffentlichen Blockchain...',
    authorId: 'u-1',
    published: true,
    tags: ['Security', 'Archive', 'Compliance'],
    updatedAt: new Date('2025-02-15')
  }
];

const MOCK_INSTRUMENTS: Instrument[] = [
  {
    id: 'i-1',
    name: 'Bürger-ID Wallet',
    type: 'SSI',
    description: 'Smartphone-App zur Haltung von eID-Derived Credentials.',
    maturityLevel: 'PILOT',
    technicalSpecs: { protocol: 'DIDComm v2', curve: 'Ed25519' }
  },
  {
    id: 'i-2',
    name: 'Bundes-Notar-Node',
    type: 'NOTARIZATION',
    description: 'Service zur Timestamp-Verankerung auf Ethereum/Polygon.',
    maturityLevel: 'PRODUCTION',
    technicalSpecs: { network: 'Polygon PoS', contract: 'ERC-721' }
  }
];

// In-memory store for demo
let logs: AuditLog[] = [];
let credentials: VerifiableCredential[] = [];

/**
 * DB Service Simulation
 */
export const DbService = {
  getUsers: async (): Promise<User[]> => {
    return new Promise(resolve => setTimeout(() => resolve(MOCK_USERS), 300));
  },

  getArticles: async (): Promise<Article[]> => {
    return new Promise(resolve => setTimeout(() => resolve(MOCK_ARTICLES), 300));
  },

  getInstruments: async (): Promise<Instrument[]> => {
    return new Promise(resolve => setTimeout(() => resolve(MOCK_INSTRUMENTS), 300));
  },

  getAuditLogs: async (): Promise<AuditLog[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...logs].reverse()), 300));
  },

  getCredentials: async (): Promise<VerifiableCredential[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...credentials]), 300));
  },

  // Core GovTech Feature: Immutable Logging
  createAuditLog: async (userId: string, action: AuditLog['action'], metadata?: string) => {
    const newLog: AuditLog = {
      id: crypto.randomUUID(),
      userId,
      action,
      metadata,
      timestamp: new Date(),
      ipHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' // Mock hashed IP
    };
    logs.push(newLog);
    console.log(`[AUDIT] ${action} by ${userId}`);
    return newLog;
  },

  // Core GovTech Feature: Storing VC Hash
  storeCredentialHash: async (holderDid: string, hash: string) => {
    const newCred: VerifiableCredential = {
      id: crypto.randomUUID(),
      holderDid,
      issuerDid: 'did:web:bund.de:registry',
      credentialHash: hash,
      issuanceDate: new Date(),
      revocationStatus: false
    };
    credentials.push(newCred);
    return newCred;
  }
};