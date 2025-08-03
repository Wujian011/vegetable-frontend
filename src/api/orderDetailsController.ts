// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 此处后端没有提供注释 GET /orderDetails/getByOrderId */
export async function getOrderDetailsByOrderId(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getOrderDetailsByOrderIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseListOrderDetailsVO>('/orderDetails/getByOrderId', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}
