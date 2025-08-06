// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 此处后端没有提供注释 POST /dishes/add */
export async function addDishes(body: API.DishesAddRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseLong>('/dishes/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /dishes/delete */
export async function deleteDishes(body: API.DeleteRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/dishes/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /dishes/get */
export async function getDishesById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getDishesByIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseDishes>('/dishes/get', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /dishes/get/vo */
export async function getDishesVoById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getDishesVOByIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseDishesVO>('/dishes/get/vo', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /dishes/list/page/my/family/vo */
export async function listMyFamilyDishesVoByPage(
  body: API.DishesQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageDishesVO>('/dishes/list/page/my/family/vo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /dishes/list/page/vo */
export async function listDishesVoByPage(
  body: API.DishesQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageDishesVO>('/dishes/list/page/vo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /dishes/update */
export async function updateDishes(
  body: API.DishesUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>('/dishes/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
