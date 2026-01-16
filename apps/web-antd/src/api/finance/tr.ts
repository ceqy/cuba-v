import { requestClient } from '#/api/request';
import type { ExecutePaymentRunRequest, PaymentRunResponse } from './types';

/**
 * TR Service API (资金管理)
 */

/**
 * 执行付款运行
 */
export async function executePaymentRun(data: ExecutePaymentRunRequest) {
  return requestClient.post<PaymentRunResponse>(
    '/v1/finance/treasury/payment-runs:execute',
    data,
  );
}

/**
 * 查询付款运行状态
 */
export async function getPaymentRunStatus(jobId: string) {
  return requestClient.get<PaymentRunResponse>(
    `/v1/finance/treasury/payment-runs/${jobId}`,
  );
}

/**
 * 查询银行余额
 */
export async function getBankBalances(params: { company_code: string }) {
  return requestClient.get<any>('/v1/finance/treasury/bank-balances', {
    params,
  });
}
