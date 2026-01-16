import { requestClient } from '#/api/request';
import type { ExecuteAllocationRequest, AllocationResponse } from './types';

/**
 * CO Service API (成本控制)
 */

/**
 * 执行成本中心分配
 */
export async function executeCostAllocation(data: ExecuteAllocationRequest) {
  return requestClient.post<AllocationResponse>(
    '/v1/finance/cost-center-allocation/execute',
    data,
  );
}

/**
 * 获取分配结果
 */
export async function getAllocationResult(runId: string) {
  return requestClient.get<any>('/v1/finance/allocation-result', {
    params: { run_id: runId },
  });
}

/**
 * 执行作业分配
 */
export async function executeActivityAllocation(data: ExecuteAllocationRequest) {
  return requestClient.post<AllocationResponse>(
    '/v1/finance/activity-allocation/execute',
    data,
  );
}
