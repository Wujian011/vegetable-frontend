// @ts-expect-error
/* eslint-disable */
import request from '@/request'

/** 此处后端没有提供注释 POST /classification/add */
export async function addClassification(
  body: API.ClassificationAddRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseLong>('/classification/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /classification/delete */
export async function deleteClassification(
  body: API.DeleteRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean>('/classification/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /classification/get */
export async function getClassificationById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getClassificationByIdParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseClassification>('/classification/get', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /classification/get/vo */
export async function getClassificationVoById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getClassificationVOByIdParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseClassificationVO>('/classification/get/vo', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /classification/getClassificationItem */
export async function getClassificationItem(options?: { [key: string]: any }) {
  return request<API.BaseResponseListClassification>('/classification/getClassificationItem', {
    method: 'GET',
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /classification/list/page/vo */
export async function listClassificationVoByPage(
  body: API.ClassificationQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageClassificationVO>('/classification/list/page/vo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /classification/update */
export async function updateClassification(
  body: API.ClassificationUpdateRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean>('/classification/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
