import { requestClient } from '#/api/request';

/**
 * AR Service API (应收账款)
 */

/**
 * 创建客户
 */
export async function createCustomer(data: any) {
  return requestClient.post<any>('/v1/finance/arap/customers', data);
}

/**
 * 创建销售发票
 */
export async function createARInvoice(data: any) {
  return requestClient.post<any>('/v1/finance/arap/sales-invoices', data);
}

/**
 * 查询应收账款未清项
 */
export async function listAROpenItems(params: {
  company_code: string;
  customer_id?: string;
}) {
  return requestClient.get<any>('/v1/finance/arap/ar-open-items', {
    params,
  });
}
