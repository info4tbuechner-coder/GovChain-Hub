
import { Article, AuditLog, Instrument, User, UserRole, VerifiableCredential, Proposal, WorkflowTask, Block, NetworkNode, UserNotification, RegistryAsset, AssetHistoryEvent, Tender, TenderBid, BudgetAccount, TokenTransaction, ComplianceAlert, ChatMessage, CrisisScenario, DataRequest } from '../types';

/**
 * Mock Data Store - Simulating Persistent Storage via LocalStorage
 */
const STORAGE_KEY = 'govchain_db_state';

// Initial Data Constants
const INITIAL_BUDGETS: BudgetAccount[] = [
    { id: 'acc-1', name: 'Haupt-Haushaltstitel 543 01', type: 'MAIN', balance: 14500000.00, currency: 'eEUR', address: '0x1A2...3B4C', restrictions: [] },
    { id: 'acc-2', name: 'Digitalpakt Schulen (Fördermittel)', type: 'PROJECT', balance: 350000, currency: 'GRANT-IT', address: '0x9C8...7D6E', restrictions: ['Vendor-Whitelist', 'Exp-2025-12-31'] },
    { id: 'acc-3', name: 'Treuhandkonto Vergabe VgV-2025-104', type: 'ESCROW', balance: 4500000.00, currency: 'eEUR', address: '0xEsc...Row1', restrictions: ['Smart-Contract-Locked'] },
    { id: 'acc-4', name: 'Notfallfonds (Katastrophenschutz)', type: 'CRISIS', balance: 0.00, currency: 'eEUR', address: '0xSOS...Help', restrictions: ['Oracle-Trigger-Only'] }
];

const INITIAL_ASSETS: RegistryAsset[] = [
    {
        id: 'WBA-192837465',
        type: 'VEHICLE',
        title: 'BMW i4 eDrive40',
        currentOwner: 'Bundesministerium des Innern (Fuhrpark)',
        status: 'ACTIVE',
        specs: { 'Baujahr': '2024', 'Farbe': 'Alpinweiß', 'Leistung': '250 kW', 'Kennzeichen': 'BD 13-204' },
        contractAddress: '0x71C...9A21',
        tokenId: '1042',
        history: [
            { id: 'h-1', date: new Date('2024-01-15'), type: 'REGISTRATION', description: 'Erstzulassung durch Zulassungsstelle Berlin', actor: 'KBA (Kraftfahrt-Bundesamt)', txHash: '0x3a1...' }
        ]
    }
];

// Internal State with Persistence
const loadState = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            // Re-instantiate Dates
            parsed.logs?.forEach((l: any) => l.timestamp = new Date(l.timestamp));
            parsed.tasks?.forEach((t: any) => t.createdAt = new Date(t.createdAt));
            parsed.dataRequests?.forEach((r: any) => { r.requestDate = new Date(r.requestDate); if(r.decisionDate) r.decisionDate = new Date(r.decisionDate); });
            return parsed;
        } catch (e) { console.error("Persistence Load Error", e); }
    }
    return null;
};

const persist = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        logs, credentials, proposals, tasks, assets, tenders, budgets, transactions, alerts, scenarios, dataRequests
    }));
};

const savedState = loadState();

let logs: AuditLog[] = savedState?.logs || [];
let credentials: VerifiableCredential[] = savedState?.credentials || [];
let proposals: Proposal[] = savedState?.proposals || [];
let tasks: WorkflowTask[] = savedState?.tasks || [
    { id: 't-1', title: 'Beschaffungsantrag IT-Hardware Q3/2025', type: 'PROCUREMENT', priority: 'HIGH', status: 'PENDING', requester: 'Referat Z I 2', createdAt: new Date(), documentRef: 'procurement_v3.pdf' }
];
let assets: RegistryAsset[] = savedState?.assets || INITIAL_ASSETS;
let tenders: Tender[] = savedState?.tenders || [];
let budgets: BudgetAccount[] = savedState?.budgets || INITIAL_BUDGETS;
let transactions: TokenTransaction[] = savedState?.transactions || [];
let alerts: ComplianceAlert[] = savedState?.alerts || [];
let scenarios: CrisisScenario[] = savedState?.scenarios || [];
let dataRequests: DataRequest[] = savedState?.dataRequests || [];
let blocks: Block[] = []; // Blocks are real-time, no persistence needed

export const DbService = {
  getUsers: async (): Promise<User[]> => [{ id: 'u-1', email: 'admin@digital.bund.de', name: 'Dr. Erika Mustermann', role: UserRole.ADMIN, department: 'IT-Sicherheit / BMI', createdAt: new Date('2024-01-01') }],
  getAuditLogs: async (): Promise<AuditLog[]> => [...logs].reverse(),
  getBudgets: async (): Promise<BudgetAccount[]> => [...budgets],
  getTransactions: async (): Promise<TokenTransaction[]> => [...transactions],
  getWorkflowTasks: async (): Promise<WorkflowTask[]> => [...tasks],
  getRegistryAssets: async (): Promise<RegistryAsset[]> => [...assets],
  getTenders: async (): Promise<Tender[]> => [...tenders],
  getDataRequests: async (): Promise<DataRequest[]> => [...dataRequests],

  /* Added getCredentials to fix missing property error in Dashboard.tsx */
  getCredentials: async (): Promise<VerifiableCredential[]> => [...credentials],

  signTask: async (taskId: string, userId: string) => {
    await new Promise(r => setTimeout(r, 1000));
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx !== -1) {
        tasks[idx].status = 'SIGNED';
        tasks[idx].signedAt = new Date();
        tasks[idx].signatureHash = '0x' + Math.random().toString(16).substring(2, 22);
        persist();
        return tasks[idx];
    }
    throw new Error("Task not found");
  },

  executeTransfer: async (accountId: string, to: string, amount: number, smartRule: string) => {
      await new Promise(r => setTimeout(r, 1500));
      const idx = budgets.findIndex(b => b.id === accountId);
      if (idx !== -1 && budgets[idx].balance >= amount) {
          budgets[idx].balance -= amount;
          const newTx: TokenTransaction = { id: crypto.randomUUID(), from: budgets[idx].name, to, amount, currency: budgets[idx].currency, timestamp: new Date(), status: 'COMPLETED', smartRule, txHash: '0x' + crypto.randomUUID().replace(/-/g,'') };
          transactions.unshift(newTx);
          persist();
          return newTx;
      }
      throw new Error("Insufficient funds");
  },

  createAuditLog: async (userId: string, action: AuditLog['action'], metadata?: string) => {
    const newLog: AuditLog = { id: crypto.randomUUID(), userId, action, metadata, timestamp: new Date(), ipHash: 'f4e2...81a0' };
    logs.push(newLog);
    persist();
    return newLog;
  },

  // Other methods similarly need persist() calls after state change...
  getInstruments: async () => [], 
  getArticles: async () => [],
  getNotifications: async () => [],
  getNetworkNodes: async () => [],
  getRecentBlocks: async () => [],
  markNotificationRead: async (id: string) => {},
  transferAsset: async (id: string, o: string, a: string) => { persist(); return assets[0]; },
  submitMockBid: async (id: string) => { persist(); return tenders[0]; },
  getComplianceAlerts: async () => [],
  verifyLogChain: async () => ({ verified: true, count: logs.length }),
  
  /* Updated sendAiPrompt to return ChatMessage with sources to fix property error in GovAiAssistant.tsx */
  sendAiPrompt: async (m: string): Promise<ChatMessage> => ({ id: 'ai', role: 'assistant', content: `Basierend auf den Blockchain-Daten zum Thema "${m}" wurden keine Anomalien festgestellt.`, timestamp: new Date(), sources: ['AUDIT_LOG_MAIN', 'BUDGET_LEDGER_2025'] }),
  
  getScenarios: async () => [],
  triggerCrisis: async (id: string, u: string) => { persist(); return scenarios[0]; },
  createDataRequest: async (t: string, p: string, l: string, d: string) => { 
      const req: DataRequest = { id: crypto.randomUUID(), requesterDept: d, targetDataset: t, purpose: p, legalBasis: l, status: 'PENDING', requestDate: new Date() };
      dataRequests.unshift(req);
      persist();
      return req;
  },
  decideDataRequest: async (id: string, d: 'APPROVED' | 'REJECTED') => { persist(); return dataRequests[0]; },
  issueCredential: async (i: string, h: string, t: any, c: any) => { persist(); return credentials[0]; },
  castVote: async (id: string, c: any) => { persist(); return proposals[0]; },
  getProposals: async () => [],
  getUserActivity: async (id: string) => logs.filter(l => l.userId === id).slice(0, 10)
};
