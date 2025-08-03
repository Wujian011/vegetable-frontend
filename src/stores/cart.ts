import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 购物车商品类型
export interface CartItem extends API.DishesVO {
  quantity: number
  selected?: boolean
}

export const useCartStore = defineStore('cart', () => {
  // 购物车商品列表
  const cartItems = ref<CartItem[]>([])

  // 计算购物车总数量
  const cartCount = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.quantity, 0)
  })

  // 计算购物车总价格
  const cartTotalPrice = computed(() => {
    return cartItems.value
      .reduce((total, item) => {
        return total + (item.price || 0) * item.quantity
      }, 0)
      .toFixed(2)
  })

  // 计算已选商品总价格
  const selectedTotalPrice = computed(() => {
    return cartItems.value
      .filter((item) => item.selected)
      .reduce((total, item) => {
        return total + (item.price || 0) * item.quantity
      }, 0)
      .toFixed(2)
  })

  // 添加商品到购物车
  const addToCart = (dish: API.DishesVO) => {
    const existingItem = cartItems.value.find((item) => item.id === dish.id)

    if (existingItem) {
      // 如果商品已存在，增加数量
      existingItem.quantity += 1
      return { isNew: false, item: existingItem }
    } else {
      // 如果商品不存在，添加新商品
      const newItem: CartItem = {
        ...dish,
        quantity: 1,
        selected: true,
      }
      cartItems.value.push(newItem)
      return { isNew: true, item: newItem }
    }
  }

  // 更新商品数量
  const updateQuantity = (dishId: number, quantity: number) => {
    const item = cartItems.value.find((item) => item.id === dishId)
    if (item) {
      if (quantity <= 0) {
        removeFromCart(dishId)
      } else {
        item.quantity = quantity
      }
    }
  }

  // 从购物车移除商品
  const removeFromCart = (dishId: number) => {
    const index = cartItems.value.findIndex((item) => item.id === dishId)
    if (index > -1) {
      cartItems.value.splice(index, 1)
    }
  }

  // 清空购物车
  const clearCart = () => {
    cartItems.value = []
  }

  // 清空已选商品
  const clearSelectedItems = () => {
    cartItems.value = cartItems.value.filter((item) => !item.selected)
  }

  // 切换商品选中状态
  const toggleItemSelection = (dishId: number, selected?: boolean) => {
    const item = cartItems.value.find((item) => item.id === dishId)
    if (item) {
      item.selected = selected !== undefined ? selected : !item.selected
    }
  }

  // 全选/取消全选
  const toggleSelectAll = (selected: boolean) => {
    cartItems.value.forEach((item) => {
      item.selected = selected
    })
  }

  // 持久化购物车数据
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('cartItems', JSON.stringify(cartItems.value))
    } catch (error) {
      console.error('保存购物车数据失败:', error)
    }
  }

  // 从本地存储加载购物车数据
  const loadFromLocalStorage = () => {
    try {
      const savedCart = localStorage.getItem('cartItems')
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)
        cartItems.value = parsedCart.map((item: any) => ({
          ...item,
          selected: item.selected !== undefined ? item.selected : true,
        }))
      }
    } catch (error) {
      console.error('加载购物车数据失败:', error)
      cartItems.value = []
    }
  }

  // 监听购物车变化，自动保存
  const watchCartChanges = () => {
    // 这里可以添加watch逻辑，但为了简化，我们在需要的地方手动调用saveToLocalStorage
  }

  return {
    // State
    cartItems,

    // Getters
    cartCount,
    cartTotalPrice,
    selectedTotalPrice,

    // Actions
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    clearSelectedItems,
    toggleItemSelection,
    toggleSelectAll,
    saveToLocalStorage,
    loadFromLocalStorage,
    watchCartChanges,
  }
})
