export interface LivingDocReport {
  id: string;
  name: string;
  file?: File;
  url: string;
  type: string;
  addedAt: Date;
  status: 'passed' | 'failed' | 'unknown';
  environment?: string;
  version?: string;
  folder?: string;
  licenseDomain?: string;
  textContent?: string;
  reviewStatus?: 'investigate' | 'good' | 'flaky' | 'none';
}
