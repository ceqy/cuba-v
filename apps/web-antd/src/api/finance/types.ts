/**
 * 财务服务 API 类型定义
 * 基础URL: http://10.0.0.101:30080/api/v1/finance
 */

/** 金额值 */
export interface MonetaryValue {
  currency_code: string;
  value: string;
}

/** 凭证引用 */
export interface DocumentReference {
  document_number: string;
  fiscal_year: number;
  company_code: string;
  document_type?: string;
  document_category?: string;
}

/** 凭证状态 */
export enum JournalEntryStatus {
  DRAFT = 'JOURNAL_ENTRY_STATUS_DRAFT',
  PENDING = 'JOURNAL_ENTRY_STATUS_PENDING',
  POSTED = 'JOURNAL_ENTRY_STATUS_POSTED',
  REVERSED = 'JOURNAL_ENTRY_STATUS_REVERSED',
}

/** GL 凭证抬头 */
export interface JournalEntryHeader {
  company_code: string;
  document_type: string;
  document_date: string;
  posting_date: string;
  fiscal_year: number;
  fiscal_period: number;
  currency: string;
  header_text?: string;
  reference_document?: string;
}

/** GL 凭证行项目 */
export interface JournalEntryLineItem {
  line_item_number: number;
  posting_key: string;
  debit_credit_indicator: string; // S=Debit, H=Credit
  gl_account: string;
  amount_in_document_currency: MonetaryValue;
  text?: string;
  cost_center?: string;
  profit_center?: string;
}

/** 创建 GL 凭证请求 */
export interface CreateJournalEntryRequest {
  header: JournalEntryHeader;
  line_items: JournalEntryLineItem[];
  post_immediately?: boolean;
}

/** GL 凭证响应 */
export interface JournalEntryResponse {
  success: boolean;
  document_reference?: DocumentReference;
  messages?: any[];
}

/** GL 凭证列表项 */
export interface JournalEntryListItem {
  document_reference: DocumentReference;
  document_date: string;
  posting_date: string;
  header_text: string;
  status: JournalEntryStatus;
}

/** GL 凭证列表响应 */
export interface ListJournalEntriesResponse {
  entries: JournalEntryListItem[];
  pagination: {
    current_page: number;
    page_size: number;
    total_items: string;
    total_pages: number;
  };
}

/** 供应商信息 */
export interface Supplier {
  supplier_id: string;
  business_partner_id?: string;
  name: string;
  account_group: string;
  company_code: string;
  reconciliation_account: string;
  payment_terms?: string;
  telephone?: string;
  email?: string;
}

/** 成本分配请求 */
export interface ExecuteAllocationRequest {
  controlling_area: string;
  fiscal_year: number;
  fiscal_period: number;
  allocation_cycle: string;
  test_run: boolean;
}

/** 成本分配响应 */
export interface AllocationResponse {
  success: boolean;
  run_id: string;
  messages?: any[];
}

/** 付款运行请求 */
export interface ExecutePaymentRunRequest {
  run_id: string;
  posting_date: string;
  parameters: {
    company_codes: string[];
    payment_methods?: string[];
    vendor_range?: string[];
  };
}

/** 付款运行响应 */
export interface PaymentRunResponse {
  job_id: string;
  job_type: string;
  status: string;
  progress_percentage: number;
  messages?: any[];
  error_detail?: string;
}
