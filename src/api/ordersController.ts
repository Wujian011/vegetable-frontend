// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 此处后端没有提供注释 POST /orders/add */
export async function addOrders(body: API.OrdersAddRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseLong>('/orders/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /orders/delete */
export async function deleteOrders(body: API.DeleteRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/orders/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /orders/get */
export async function getOrdersById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getOrdersByIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseOrders>('/orders/get', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /orders/get/vo */
export async function getOrdersVoById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getOrdersVOByIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseOrdersVO>('/orders/get/vo', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /orders/list/page/vo */
export async function listOrdersVoByPage(
  body: API.OrdersQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageOrdersVO>('/orders/list/page/vo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /orders/list/page/vo/my */
export async function listOrdersVoPageByMy(
  body: API.OrdersQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageOrdersVO>('/orders/list/page/vo/my', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /orders/update */
export async function updateOrders(
  body: API.OrdersUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>('/orders/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
