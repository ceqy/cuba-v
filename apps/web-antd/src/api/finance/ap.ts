import { requestClient } from '#/api/request';
import type { Supplier } from './types';

/**
 * AP Service API (应付账款)
 */

/**
 * 创建供应商
 */
export async function createSupplier(data: Supplier) {
  return requestClient.post<Supplier>('/v1/finance/arap/suppliers', data);
}

/**
 * 查询供应商列表
 */
export async function listSuppliers(params?: {
  company_code?: string;
  page?: number;
  page_size?: number;
}) {
  return requestClient.get<{ suppliers: Supplier[] }>(
    '/v1/finance/arap/suppliers',
    { params },
  );
}

/**
 * 获取供应商详情
 */
export async function getSupplier(supplierId: string) {
  return requestClient.get<Supplier>(
    `/v1/finance/arap/suppliers/${supplierId}`,
  );
}

/**
 * 创建供应商发票
 */
export async function createAPInvoice(data: any) {
  return requestClient.post<any>('/v1/finance/arap/invoices', data);
}

/**
 * 查询应付账款未清项
 */
export async function listAPOpenItems(params: {
  company_code: string;
  supplier_id?: string;
}) {
  return requestClient.get<any>('/v1/finance/arap/open-items', { params });
}
