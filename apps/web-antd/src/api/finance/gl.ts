import { requestClient } from '#/api/request';
import type {
  CreateJournalEntryRequest,
  JournalEntryResponse,
  ListJournalEntriesResponse,
} from './types';

/**
 * GL Service API (总账)
 */

/**
 * 创建 GL 凭证
 */
export async function createJournalEntry(data: CreateJournalEntryRequest) {
  return requestClient.post<JournalEntryResponse>(
    '/v1/finance/gl/journal-entries',
    data,
  );
}

/**
 * 查询 GL 凭证列表
 */
export async function listJournalEntries(params: {
  company_code: string;
  fiscal_year: number;
  page?: number;
  page_size?: number;
}) {
  return requestClient.get<ListJournalEntriesResponse>(
    '/v1/finance/gl/journal-entries',
    { params },
  );
}

/**
 * 获取 GL 凭证详情
 */
export async function getJournalEntry(journalEntryId: string) {
  return requestClient.get<any>(
    `/v1/finance/gl/journal-entries/${journalEntryId}`,
  );
}

/**
 * 过账 GL 凭证
 */
export async function postJournalEntry(journalEntryId: string) {
  return requestClient.post<JournalEntryResponse>(
    `/v1/finance/gl/journal-entries/${journalEntryId}/post`,
  );
}

/**
 * 冲销 GL 凭证
 */
export async function reverseJournalEntry(
  journalEntryId: string,
  data: { reversal_date: string; reversal_reason?: string },
) {
  return requestClient.post<JournalEntryResponse>(
    `/v1/finance/gl/journal-entries/${journalEntryId}/reverse`,
    data,
  );
}
