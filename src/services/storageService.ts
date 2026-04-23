import { get, set, del } from 'idb-keyval';

// Keys for localStorage
const METADATA_KEY = 'livingdoc_reports_metadata';
const SETTINGS_KEY = 'livingdoc_settings';

export interface ReportMetadata {
  id: string;
  name: string;
  type: string;
  addedAt: string; // ISO string for JSON
  status: 'passed' | 'failed' | 'unknown';
  environment?: string;
  version?: string;
  folder?: string;
  licenseDomain?: string;
  textContent?: string;
  reviewStatus?: 'investigate' | 'good' | 'flaky' | 'none';
}

export type UserRole = 'Administrator' | 'Viewer';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
}

export interface AppSettings {
  isLibraryLocked: boolean;
  selectedEnv: string;
  regressionReleaseName?: string;
  selectedDomain: string;
  batchEnv: string;
  batchVersion: string;
  batchFolder: string;
  batchLicenseDomain: string;
  allowUploads: boolean;
  isAutoSortEnabled?: boolean;
  currentUser?: User;
}

export const storageService = {
  async saveReport(metadata: ReportMetadata, fileContent: ArrayBuffer) {
    // Save metadata in a list in localStorage
    const existing = this.getReportsMetadata();
    const updated = [...existing.filter(r => r.id !== metadata.id), metadata];
    localStorage.setItem(METADATA_KEY, JSON.stringify(updated));

    // Save binary in IndexedDB
    await set(`content_${metadata.id}`, fileContent);
  },

  async updateReportMetadata(id: string, updates: Partial<ReportMetadata>) {
    const existing = this.getReportsMetadata();
    const updated = existing.map(r => r.id === id ? { ...r, ...updates } : r);
    localStorage.setItem(METADATA_KEY, JSON.stringify(updated));
  },

  getReportsMetadata(): ReportMetadata[] {
    const data = localStorage.getItem(METADATA_KEY);
    return data ? JSON.parse(data) : [];
  },

  async getReportContent(id: string): Promise<ArrayBuffer | undefined> {
    return await get(`content_${id}`);
  },

  async deleteReport(id: string) {
    const existing = this.getReportsMetadata();
    const updated = existing.filter(r => r.id !== id);
    localStorage.setItem(METADATA_KEY, JSON.stringify(updated));
    await del(`content_${id}`);
  },

  saveSettings(settings: AppSettings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  getSettings(): AppSettings | null {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : null;
  }
};
