/**
 * 用户角色相关常量
 */

// 情侣角色枚举
export const COUPLE_ROLE = {
  FEEDER: 'feeder', // 饲养员
  FOODIE: 'foodie', // 吃货
} as const

// 情侣角色显示名称
export const COUPLE_ROLE_TEXT = {
  [COUPLE_ROLE.FEEDER]: '饲养员',
  [COUPLE_ROLE.FOODIE]: '吃货',
} as const

// 情侣角色选项（用于选择器等组件）
export const COUPLE_ROLE_OPTIONS = [
  {
    text: COUPLE_ROLE_TEXT[COUPLE_ROLE.FEEDER],
    value: COUPLE_ROLE.FEEDER,
    icon: '👨‍🍳', // 饲养员图标
  },
  {
    text: COUPLE_ROLE_TEXT[COUPLE_ROLE.FOODIE],
    value: COUPLE_ROLE.FOODIE,
    icon: '😋', // 吃货图标
  },
] as const

// 类型定义
export type CoupleRole = (typeof COUPLE_ROLE)[keyof typeof COUPLE_ROLE]
