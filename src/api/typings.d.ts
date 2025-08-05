declare namespace API {
  type BaseResponseBoolean = {
    code?: number
    data?: boolean
    message?: string
  }

  type BaseResponseClassification = {
    code?: number
    data?: Classification
    message?: string
  }

  type BaseResponseClassificationVO = {
    code?: number
    data?: ClassificationVO
    message?: string
  }

  type BaseResponseDishes = {
    code?: number
    data?: Dishes
    message?: string
  }

  type BaseResponseDishesVO = {
    code?: number
    data?: DishesVO
    message?: string
  }

  type BaseResponseListClassification = {
    code?: number
    data?: Classification[]
    message?: string
  }

  type BaseResponseListOrderDetailsVO = {
    code?: number
    data?: OrderDetailsVO[]
    message?: string
  }

  type BaseResponseLoginUserVO = {
    code?: number
    data?: LoginUserVO
    message?: string
  }

  type BaseResponseLong = {
    code?: number
    data?: number
    message?: string
  }

  type BaseResponseOrders = {
    code?: number
    data?: Orders
    message?: string
  }

  type BaseResponseOrdersVO = {
    code?: number
    data?: OrdersVO
    message?: string
  }

  type BaseResponsePageClassificationVO = {
    code?: number
    data?: PageClassificationVO
    message?: string
  }

  type BaseResponsePageDishesVO = {
    code?: number
    data?: PageDishesVO
    message?: string
  }

  type BaseResponsePageOrdersVO = {
    code?: number
    data?: PageOrdersVO
    message?: string
  }

  type BaseResponsePageUserVO = {
    code?: number
    data?: PageUserVO
    message?: string
  }

  type BaseResponseString = {
    code?: number
    data?: string
    message?: string
  }

  type BaseResponseUser = {
    code?: number
    data?: User
    message?: string
  }

  type BaseResponseUserVO = {
    code?: number
    data?: UserVO
    message?: string
  }

  type Classification = {
    id?: number
    name?: string
    code?: string
    userId?: number
    editTime?: string
    createTime?: string
    updateTime?: string
    isDelete?: number
  }

  type ClassificationAddRequest = {
    name?: string
    code?: string
  }

  type ClassificationQueryRequest = {
    pageNum?: number
    pageSize?: number
    sortField?: string
    sortOrder?: string
    id?: number
    name?: string
    code?: string
  }

  type ClassificationUpdateRequest = {
    id?: number
    name?: string
    code?: string
  }

  type ClassificationVO = {
    id?: number
    name?: string
    code?: string
    createTime?: string
  }

  type DeleteRequest = {
    id?: number
  }

  type Dishes = {
    id?: number
    classificationId?: number
    name?: string
    price?: number
    material?: string
    dishesImage?: string
    userId?: number
    editTime?: string
    createTime?: string
    updateTime?: string
    isDelete?: number
  }

  type DishesAddRequest = {
    classificationId?: number
    name?: string
    price?: number
    material?: string
    dishesImage?: string
  }

  type DishesQueryRequest = {
    pageNum?: number
    pageSize?: number
    sortField?: string
    sortOrder?: string
    id?: number
    classificationId?: number
    name?: string
    price?: number
    material?: string
    userId?: number
  }

  type DishesUpdateRequest = {
    id?: number
    classificationId?: number
    name?: string
    price?: number
    material?: string
    dishesImage?: string
    userId?: number
  }

  type DishesVO = {
    id?: number
    name?: string
    price?: number
    material?: string
    dishesImage?: string
    userId?: number
  }

  type getClassificationByIdParams = {
    id: number
  }

  type getClassificationVOByIdParams = {
    id: number
  }

  type getDishesByIdParams = {
    id: number
  }

  type getDishesVOByIdParams = {
    id: number
  }

  type getInfoParams = {
    id: number
  }

  type getOrderDetailsByOrderIdParams = {
    orderId: number
  }

  type getOrdersByIdParams = {
    id: number
  }

  type getOrdersVOByIdParams = {
    id: number
  }

  type getUserByIdParams = {
    id: number
  }

  type getUserVOByIdParams = {
    id: number
  }

  type JoinFamilyRequest = {
    userId?: number
    coupleRole?: string
  }

  type LoginUserVO = {
    id?: number
    userAccount?: string
    userName?: string
    userAvatar?: string
    userProfile?: string
    userRole?: string
    createTime?: string
    updateTime?: string
    partnerUser?: LoginUserVO
    partnerBindTime?: string
    inviteCode?: string
    coupleRole?: string
  }

  type OrderDetailsVO = {
    id?: number
    dishesVO?: DishesVO
    price?: number
    number?: number
    editTime?: string
    createTime?: string
  }

  type Orders = {
    id?: number
    orderNumber?: string
    price?: number
    userId?: number
    editTime?: string
    createTime?: string
    updateTime?: string
    isDelete?: number
  }

  type OrdersAddRequest = {
    price?: number
    ordersDetailsAddRequestList?: OrdersDetailsAddRequest[]
  }

  type OrdersDetailsAddRequest = {
    dishesId?: number
    price?: number
    number?: number
  }

  type OrdersQueryRequest = {
    pageNum?: number
    pageSize?: number
    sortField?: string
    sortOrder?: string
    id?: number
    price?: number
    userId?: number
  }

  type OrdersUpdateRequest = {
    id?: number
    price?: number
  }

  type OrdersVO = {
    id?: number
    dishesId?: number
    price?: number
    orderDetailsVOList?: OrderDetailsVO[]
  }

  type PageClassificationVO = {
    records?: ClassificationVO[]
    pageNumber?: number
    pageSize?: number
    totalPage?: number
    totalRow?: number
    optimizeCountQuery?: boolean
  }

  type PageDishesVO = {
    records?: DishesVO[]
    pageNumber?: number
    pageSize?: number
    totalPage?: number
    totalRow?: number
    optimizeCountQuery?: boolean
  }

  type PageOrdersVO = {
    records?: OrdersVO[]
    pageNumber?: number
    pageSize?: number
    totalPage?: number
    totalRow?: number
    optimizeCountQuery?: boolean
  }

  type pageParams = {
    page: PageShoppingCart
  }

  type PageShoppingCart = {
    records?: ShoppingCart[]
    pageNumber?: number
    pageSize?: number
    totalPage?: number
    totalRow?: number
    optimizeCountQuery?: boolean
  }

  type PageUserVO = {
    records?: UserVO[]
    pageNumber?: number
    pageSize?: number
    totalPage?: number
    totalRow?: number
    optimizeCountQuery?: boolean
  }

  type removeParams = {
    id: number
  }

  type ShoppingCart = {
    id?: number
    dishesId?: number
    number?: number
    editTime?: string
    createTime?: string
    updateTime?: string
    isDelete?: number
  }

  type User = {
    id?: number
    userAccount?: string
    userPassword?: string
    userName?: string
    userAvatar?: string
    userProfile?: string
    userRole?: string
    editTime?: string
    createTime?: string
    updateTime?: string
    isDelete?: number
    partnerId?: number
    partnerBindTime?: string
    inviteCode?: string
    coupleRole?: string
    coupleRoleSetTime?: string
  }

  type UserAddRequest = {
    userName?: string
    userAccount?: string
    userAvatar?: string
    userProfile?: string
    userRole?: string
  }

  type UserEditeRequest = {
    id?: number
    userName?: string
    userAvatar?: string
    userProfile?: string
    coupleRole?: string
  }

  type UserLoginRequest = {
    userAccount?: string
    userPassword?: string
  }

  type UserQueryRequest = {
    pageNum?: number
    pageSize?: number
    sortField?: string
    sortOrder?: string
    id?: number
    userName?: string
    userAccount?: string
    userProfile?: string
    userRole?: string
  }

  type UserRegisterRequest = {
    userAccount?: string
    userPassword?: string
    checkPassword?: string
  }

  type UserUpdateRequest = {
    id?: number
    userName?: string
    userAvatar?: string
    userProfile?: string
    userRole?: string
  }

  type UserVO = {
    id?: number
    userAccount?: string
    userName?: string
    userAvatar?: string
    userProfile?: string
    userRole?: string
    createTime?: string
    partnerId?: number
    partnerName?: string
    partnerAvatar?: string
    partnerBindTime?: string
    hasPartner?: boolean
  }
}
