import { Article, AuditLog, Instrument, User, UserRole, VerifiableCredential, Proposal, WorkflowTask, Block, NetworkNode, UserNotification, RegistryAsset, AssetHistoryEvent, Tender, TenderBid, BudgetAccount, TokenTransaction, ComplianceAlert } from '../types';

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

const MOCK_ALERTS: ComplianceAlert[] = [
    {
        id: 'al-1',
        severity: 'CRITICAL',
        category: 'INTEGRITY',
        message: 'Merkle Root Mismatch: Audit Log Eintrag #9921 wurde verändert.',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        status: 'OPEN',
        relatedLogId: 'hist-0-2'
    },
    {
        id: 'al-2',
        severity: 'HIGH',
        category: 'ACCESS',
        message: 'Zugriffsversuch außerhalb der Dienstzeiten (03:14 Uhr).',
        timestamp: new Date(Date.now() - 86400000 * 2),
        status: 'RESOLVED',
        relatedLogId: 'hist-2-5'
    },
    {
        id: 'al-3',
        severity: 'MEDIUM',
        category: 'SMART_CONTRACT',
        message: 'High Value Transaction (> 1 Mio €) ohne 4-Augen-Prinzip initiiert.',
        timestamp: new Date(Date.now() - 86400000 * 5),
        status: 'INVESTIGATING'
    }
];

const MOCK_BUDGETS: BudgetAccount[] = [
    {
        id: 'acc-1',
        name: 'Haupt-Haushaltstitel 543 01',
        type: 'MAIN',
        balance: 14500000.00,
        currency: 'eEUR',
        address: '0x1A2...3B4C',
        restrictions: []
    },
    {
        id: 'acc-2',
        name: 'Digitalpakt Schulen (Fördermittel)',
        type: 'PROJECT',
        balance: 350000,
        currency: 'GRANT-IT',
        address: '0x9C8...7D6E',
        restrictions: ['Vendor-Whitelist', 'Exp-2025-12-31']
    },
    {
        id: 'acc-3',
        name: 'Treuhandkonto Vergabe VgV-2025-104',
        type: 'ESCROW',
        balance: 4500000.00,
        currency: 'eEUR',
        address: '0xEsc...Row1',
        restrictions: ['Smart-Contract-Locked']
    }
];

const MOCK_TRANSACTIONS: TokenTransaction[] = [
    {
        id: 'tx-1',
        from: 'Bundesfinanzministerium',
        to: 'Haupt-Haushaltstitel 543 01',
        amount: 5000000,
        currency: 'eEUR',
        timestamp: new Date(Date.now() - 604800000), // 1 week ago
        status: 'COMPLETED',
        txHash: '0x7a...1b'
    },
    {
        id: 'tx-2',
        from: 'Haupt-Haushaltstitel 543 01',
        to: 'Dienstleister Bechtle AG',
        amount: 12450.50,
        currency: 'eEUR',
        timestamp: new Date(Date.now() - 172800000), // 2 days ago
        status: 'COMPLETED',
        smartRule: 'Rechnung #99281',
        txHash: '0x2c...4d'
    }
];

const MOCK_TENDERS: Tender[] = [
    {
        id: 'tend-1',
        refNumber: 'VgV-2025-104',
        title: 'Neubau Rechenzentrum Berlin-Süd',
        description: 'Generalunternehmerleistung für den Rohbau und die technische Gebäudeausrüstung (TGA) gemäß DIN EN 50600.',
        budget: '45.000.000 €',
        deadline: new Date('2025-11-30'),
        status: 'OPEN',
        contractAddress: '0x38B...91A2',
        bids: [
            { id: 'b-1', timestamp: new Date('2025-02-01'), bidderHash: '0x9a...b2', offerHash: '0x8f...11', status: 'SEALED' },
            { id: 'b-2', timestamp: new Date('2025-02-15'), bidderHash: '0x1c...d4', offerHash: '0x3e...22', status: 'SEALED' }
        ]
    },
    {
        id: 'tend-2',
        refNumber: 'UVgO-2025-089',
        title: 'IT-Support-Dienstleistungen',
        description: 'Rahmenvertrag für 2nd und 3rd Level Support der Bundes-Cloud Infrastruktur.',
        budget: '2.500.000 €',
        deadline: new Date('2025-03-15'),
        status: 'REVIEW',
        contractAddress: '0x44C...D3E1',
        bids: [
            { id: 'b-3', timestamp: new Date('2025-03-10'), bidderHash: '0x7e...f1', offerHash: '0x2a...bb', status: 'REVEALED', amount: 2450000 },
            { id: 'b-4', timestamp: new Date('2025-03-14'), bidderHash: '0x5b...a9', offerHash: '0x9c...dd', status: 'REVEALED', amount: 2380000 },
             { id: 'b-5', timestamp: new Date('2025-03-15'), bidderHash: '0x2d...c3', offerHash: '0x1f...ee', status: 'REVEALED', amount: 2600000 }
        ]
    }
];

const MOCK_ASSETS: RegistryAsset[] = [
    {
        id: 'WBA-192837465',
        type: 'VEHICLE',
        title: 'BMW i4 eDrive40',
        currentOwner: 'Bundesministerium des Innern (Fuhrpark)',
        status: 'ACTIVE',
        specs: {
            'Baujahr': '2024',
            'Farbe': 'Alpinweiß',
            'Leistung': '250 kW',
            'Kennzeichen': 'BD 13-204'
        },
        contractAddress: '0x71C...9A21',
        tokenId: '1042',
        history: [
            {
                id: 'h-1',
                date: new Date('2024-01-15'),
                type: 'REGISTRATION',
                description: 'Erstzulassung durch Zulassungsstelle Berlin',
                actor: 'KBA (Kraftfahrt-Bundesamt)',
                txHash: '0x3a1...'
            },
            {
                id: 'h-2',
                date: new Date('2024-06-20'),
                type: 'INSPECTION',
                description: 'Sicherheitsprüfung nach § 29 StVZO ohne Mängel',
                actor: 'TÜV Rheinland',
                txHash: '0x8b2...'
            }
        ]
    },
    {
        id: 'DE-BE-102938',
        type: 'REAL_ESTATE',
        title: 'Verwaltungsgebäude Haus A',
        currentOwner: 'BIMA (Bundesanstalt für Immobilienaufgaben)',
        status: 'ACTIVE',
        specs: {
            'Flurstück': '120/42',
            'Gemarkung': 'Berlin-Mitte',
            'Fläche': '4.500 m²',
            'Nutzung': 'Bürogebäude'
        },
        contractAddress: '0x99A...B3C1',
        tokenId: '5501',
        history: [
            {
                id: 'h-3',
                date: new Date('2010-03-01'),
                type: 'REGISTRATION',
                description: 'Digitalisierung des Grundbucheintrags',
                actor: 'Amtsgericht Mitte',
                txHash: '0x1c9...'
            },
            {
                id: 'h-4',
                date: new Date('2022-11-10'),
                type: 'MODIFICATION',
                description: 'Eintragung Sanierungsvermerk',
                actor: 'Bauamt Berlin',
                txHash: '0x4d5...'
            }
        ]
    }
];

const MOCK_NOTIFICATIONS: UserNotification[] = [
    {
        id: 'n-1',
        title: 'Sicherheitsupdate v2.4.1',
        message: 'Ein kritisches Update für den Signatur-Node wurde eingespielt.',
        type: 'INFO',
        timestamp: new Date(Date.now() - 3600000),
        read: false,
        linkTo: 'network'
    },
    {
        id: 'n-2',
        title: 'Dokument signiert',
        message: 'Der Vorgang "Genehmigung Dienstreise" wurde erfolgreich signiert.',
        type: 'SUCCESS',
        timestamp: new Date(Date.now() - 86400000),
        read: true,
        linkTo: 'signatures'
    },
    {
        id: 'n-3',
        title: 'Neue Abstimmung',
        message: 'Eine neue Abstimmung zum Thema "Budget 2026" ist verfügbar.',
        type: 'WARNING', // Use warning color to attract attention
        timestamp: new Date(Date.now() - 172800000),
        read: false,
        linkTo: 'voting'
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

const MOCK_TASKS: WorkflowTask[] = [
    {
        id: 't-1',
        title: 'Beschaffungsantrag IT-Hardware Q3/2025',
        type: 'PROCUREMENT',
        priority: 'HIGH',
        status: 'PENDING',
        requester: 'Referat Z I 2',
        createdAt: new Date(),
        documentRef: 'procurement_v3.pdf'
    },
    {
        id: 't-2',
        title: 'Rechtsgutachten DSGVO-Novelle',
        type: 'LEGAL',
        priority: 'MEDIUM',
        status: 'PENDING',
        requester: 'Justiziariat',
        createdAt: new Date(Date.now() - 86400000), // Yesterday
        documentRef: 'gutachten_draft.pdf'
    },
    {
        id: 't-3',
        title: 'Genehmigung Dienstreise Brüssel',
        type: 'HR',
        priority: 'LOW',
        status: 'SIGNED',
        requester: 'M. Mustermann',
        createdAt: new Date(Date.now() - 172800000),
        signedAt: new Date(Date.now() - 86400000),
        documentRef: 'travel_req_approved.pdf',
        signatureHash: '0x8f7d...'
    }
];

const MOCK_NODES: NetworkNode[] = [
    { id: 'n-1', name: 'Validator-BMI-01', organization: 'BMI (Bundesministerium des Innern)', status: 'ACTIVE', latency: 12, peers: 24, version: 'v2.4.0', role: 'VALIDATOR' },
    { id: 'n-2', name: 'Validator-BDR-04', organization: 'Bundesdruckerei GmbH', status: 'ACTIVE', latency: 8, peers: 28, version: 'v2.4.0', role: 'VALIDATOR' },
    { id: 'n-3', name: 'Validator-BSI-02', organization: 'BSI (Bundesamt für Sicherheit)', status: 'SYNCING', latency: 45, peers: 12, version: 'v2.4.1-rc', role: 'VALIDATOR' },
    { id: 'n-4', name: 'Observer-Datenschutz', organization: 'BfDI', status: 'ACTIVE', latency: 22, peers: 45, version: 'v2.4.0', role: 'OBSERVER' },
];

const generateBlocks = (): Block[] => {
    const blocks: Block[] = [];
    const now = Date.now();
    for (let i = 0; i < 5; i++) {
        blocks.push({
            height: 19284000 - i,
            hash: '0x' + Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2),
            timestamp: new Date(now - i * 12000), // 1 block every 12s
            proposer: i % 2 === 0 ? 'Validator-BMI-01' : 'Validator-BDR-04',
            txCount: Math.floor(Math.random() * 50) + 10,
            size: Math.floor(Math.random() * 100) + 20
        });
    }
    return blocks;
};

// Helper to generate historical logs for the chart
const generateHistoricalLogs = (): AuditLog[] => {
    const actions: AuditLog['action'][] = ['LOGIN', 'VIEW_DOC', 'ANCHOR_HASH', 'VERIFY_CREDENTIAL', 'ISSUE_CREDENTIAL', 'CAST_VOTE', 'SIGN_DOCUMENT'];
    const generated: AuditLog[] = [];
    const now = new Date();
    
    // Generate logs for the last 7 days
    for (let i = 6; i >= 0; i--) {
        const day = new Date(now);
        day.setDate(now.getDate() - i);
        // Random number of events per day (5-30)
        const count = Math.floor(Math.random() * 25) + 5;
        
        for (let j = 0; j < count; j++) {
            generated.push({
                id: `hist-${i}-${j}`,
                userId: Math.random() > 0.7 ? 'u-admin-001' : 'system-automator',
                action: actions[Math.floor(Math.random() * actions.length)],
                timestamp: new Date(day.setHours(Math.random() * 23, Math.random() * 59)),
                ipHash: 'mock-hash'
            });
        }
    }
    return generated;
};

// In-memory store for demo
let logs: AuditLog[] = generateHistoricalLogs();
let credentials: VerifiableCredential[] = [];
let proposals: Proposal[] = [...MOCK_PROPOSALS];
let tasks: WorkflowTask[] = [...MOCK_TASKS];
let blocks: Block[] = generateBlocks();
let notifications: UserNotification[] = [...MOCK_NOTIFICATIONS];
let assets: RegistryAsset[] = [...MOCK_ASSETS];
let tenders: Tender[] = [...MOCK_TENDERS];
let budgets: BudgetAccount[] = [...MOCK_BUDGETS];
let transactions: TokenTransaction[] = [...MOCK_TRANSACTIONS];
let alerts: ComplianceAlert[] = [...MOCK_ALERTS];

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
  
  // Gets logs only for a specific user ID (for Profile view)
  getUserActivity: async (userId: string): Promise<AuditLog[]> => {
     await new Promise(resolve => setTimeout(resolve, 300));
     return [...logs]
        .filter(l => l.userId === userId || l.userId === 'u-admin-001') 
        .reverse()
        .slice(0, 20);
  },

  getCredentials: async (): Promise<VerifiableCredential[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...credentials]), 300));
  },

  getProposals: async (): Promise<Proposal[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...proposals]), 400));
  },
  
  getWorkflowTasks: async (): Promise<WorkflowTask[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...tasks]), 300));
  },

  getNetworkNodes: async (): Promise<NetworkNode[]> => {
     return new Promise(resolve => setTimeout(() => resolve(MOCK_NODES), 300));
  },

  getRecentBlocks: async (): Promise<Block[]> => {
    // Add a new block occasionally
    if (Math.random() > 0.7) {
        const lastHeight = blocks[0].height;
        const newBlock: Block = {
            height: lastHeight + 1,
            hash: '0x' + Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2),
            timestamp: new Date(),
            proposer: ['Validator-BMI-01', 'Validator-BDR-04', 'Validator-BSI-02'][Math.floor(Math.random() * 3)],
            txCount: Math.floor(Math.random() * 30),
            size: Math.floor(Math.random() * 80) + 10
        };
        blocks.unshift(newBlock);
        if (blocks.length > 10) blocks.pop();
    }
    return new Promise(resolve => setTimeout(() => resolve([...blocks]), 300));
  },

  getNotifications: async (): Promise<UserNotification[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...notifications].sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime())), 200));
  },

  markNotificationRead: async (id: string) => {
    const idx = notifications.findIndex(n => n.id === id);
    if (idx !== -1) {
        notifications[idx].read = true;
    }
    return Promise.resolve();
  },

  getRegistryAssets: async (): Promise<RegistryAsset[]> => {
      return new Promise(resolve => setTimeout(() => resolve([...assets]), 300));
  },

  transferAsset: async (assetId: string, newOwner: string, actor: string) => {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Blockchain delay
      const idx = assets.findIndex(a => a.id === assetId);
      if (idx !== -1) {
          assets[idx].currentOwner = newOwner;
          assets[idx].history.unshift({
              id: crypto.randomUUID(),
              date: new Date(),
              type: 'TRANSFER',
              description: `Eigentumsübertrag an ${newOwner}`,
              actor: actor,
              txHash: '0x' + crypto.randomUUID().replace(/-/g, '')
          });
          return assets[idx];
      }
      throw new Error("Asset not found");
  },

  getTenders: async (): Promise<Tender[]> => {
      return new Promise(resolve => setTimeout(() => resolve([...tenders]), 300));
  },

  submitMockBid: async (tenderId: string) => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const idx = tenders.findIndex(t => t.id === tenderId);
      if(idx !== -1) {
          tenders[idx].bids.push({
              id: crypto.randomUUID(),
              timestamp: new Date(),
              bidderHash: '0x' + crypto.randomUUID().substring(0,8), // Simulated external bidder
              offerHash: '0x' + crypto.randomUUID().replace(/-/g,''),
              status: 'SEALED'
          });
          return tenders[idx];
      }
      throw new Error("Tender not found");
  },

  getBudgets: async (): Promise<BudgetAccount[]> => {
      return new Promise(resolve => setTimeout(() => resolve([...budgets]), 300));
  },

  getTransactions: async (): Promise<TokenTransaction[]> => {
      return new Promise(resolve => setTimeout(() => resolve([...transactions].sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime())), 300));
  },

  executeTransfer: async (accountId: string, to: string, amount: number, smartRule: string) => {
      await new Promise(resolve => setTimeout(resolve, 1800)); // Block delay
      const idx = budgets.findIndex(b => b.id === accountId);
      if (idx !== -1 && budgets[idx].balance >= amount) {
          budgets[idx].balance -= amount;
          
          const newTx: TokenTransaction = {
              id: crypto.randomUUID(),
              from: budgets[idx].name,
              to: to,
              amount: amount,
              currency: budgets[idx].currency,
              timestamp: new Date(),
              status: 'COMPLETED',
              smartRule: smartRule,
              txHash: '0x' + crypto.randomUUID().replace(/-/g,'')
          };
          transactions.unshift(newTx);
          return newTx;
      }
      throw new Error("Insufficient funds or account not found");
  },

  getComplianceAlerts: async (): Promise<ComplianceAlert[]> => {
      return new Promise(resolve => setTimeout(() => resolve([...alerts]), 300));
  },

  verifyLogChain: async (): Promise<{verified: boolean, count: number}> => {
      await new Promise(resolve => setTimeout(resolve, 2500)); // Sim calc time
      return { verified: true, count: logs.length };
  },

  signTask: async (taskId: string, userId: string) => {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Signature delay
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx !== -1) {
        tasks[idx].status = 'SIGNED';
        tasks[idx].signedAt = new Date();
        tasks[idx].signatureHash = '0x' + Array.from(crypto.getRandomValues(new Uint8Array(20))).map(b => b.toString(16).padStart(2, '0')).join('');
        return tasks[idx];
    }
    throw new Error("Task not found");
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