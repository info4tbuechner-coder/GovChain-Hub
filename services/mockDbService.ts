import { Article, AuditLog, Instrument, User, UserRole, VerifiableCredential, Proposal } from '../types';

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
  },
  {
    id: 'i-3',
    name: 'Secure Vote Chain',
    type: 'VOTING',
    description: 'Modul für manipulationssichere Bürgerbeteiligung und kommunale Abstimmungen.',
    maturityLevel: 'PILOT',
    technicalSpecs: { mechanism: 'Quadratic Voting', privacy: 'Ring Signatures' }
  }
];

const MOCK_PROPOSALS: Proposal[] = [
  {
    id: 'p-1',
    title: 'Digitalisierung Budget 2026',
    description: 'Soll das Budget für die digitale Infrastruktur der Schulen um 15% erhöht werden? Die Finanzierung erfolgt durch Umschichtung im Bereich Straßenbau.',
    startDate: new Date('2025-03-01'),
    endDate: new Date('2025-03-30'),
    status: 'ACTIVE',
    votesFor: 1243,
    votesAgainst: 420,
    votesAbstain: 85,
    totalVoters: 1748
  },
  {
    id: 'p-2',
    title: 'Modellprojekt: Autofreie Innenstadt',
    description: 'Einführung einer temporären autofreien Zone im Regierungsviertel für 6 Monate zur Erprobung neuer Mobilitätskonzepte.',
    startDate: new Date('2025-02-15'),
    endDate: new Date('2025-03-15'),
    status: 'ACTIVE',
    votesFor: 890,
    votesAgainst: 910,
    votesAbstain: 30,
    totalVoters: 1830
  },
  {
    id: 'p-3',
    title: 'Sanierung Stadtpark Mitte',
    description: 'Bewilligung der Gelder für die Neugestaltung der Grünflächen.',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-01-31'),
    status: 'CLOSED',
    votesFor: 2500,
    votesAgainst: 120,
    votesAbstain: 10,
    totalVoters: 2630
  }
];

// In-memory store for demo
let logs: AuditLog[] = [];
let credentials: VerifiableCredential[] = [];
let proposals: Proposal[] = [...MOCK_PROPOSALS];

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

  getProposals: async (): Promise<Proposal[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...proposals]), 400));
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
    return newLog;
  },

  // Core GovTech Feature: Storing VC Hash
  issueCredential: async (issuerDid: string, holderName: string, type: VerifiableCredential['type'], claims: Record<string, string>) => {
    const vc: VerifiableCredential = {
      id: crypto.randomUUID(),
      type,
      holderName,
      holderDid: `did:key:z${Math.random().toString(36).substring(7)}`,
      issuerDid,
      credentialHash: '0x' + Math.random().toString(16).substring(2),
      claims,
      issuanceDate: new Date(),
      revocationStatus: false
    };
    credentials.push(vc);
    return vc;
  },

  castVote: async (proposalId: string, choice: 'FOR' | 'AGAINST' | 'ABSTAIN') => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Sim delay
    const idx = proposals.findIndex(p => p.id === proposalId);
    if (idx !== -1) {
        if (choice === 'FOR') proposals[idx].votesFor++;
        if (choice === 'AGAINST') proposals[idx].votesAgainst++;
        if (choice === 'ABSTAIN') proposals[idx].votesAbstain++;
        proposals[idx].totalVoters++;
        return proposals[idx];
    }
    throw new Error("Proposal not found");
  }
};