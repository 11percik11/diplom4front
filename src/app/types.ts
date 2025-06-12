export type UserRole = "ADMIN" | "MANAGER" | "CLIENT"

export type User = {
  id: string
  password: string
  email: string
  name: string
  phone?: string
  role: UserRole
  avatarUrl?: string
  refreshToken: string
  isActivated: boolean
  activatedLink: string

  createdAt: Date
  updatedAt: Date

  products: Product[]
  likes: Like[]
  comments: Comment[]
  chats: Chat[]
  userChats: UserChat[]
  messages: Message[]
  cart?: Cart
  orders: Order[]
  purchasedProducts: string[] // массив ID товаров
}

export type ProductImage = {
  id: string
  url: string
  productId: string
}

export type SizeEntry = {
  size: string
  quantity: number
}

export type ProductVariant = {
  id: string
  color: string
  productId: string
  images: ProductImage[]
  sizes: SizeEntry[]
  discounts: any
}

export type Product = {
  id: string
  title: string
  description: string
  price: number

  createdAt: Date
  userId: string
  user: User
  
  sex: string
  model: string
  age: string
  visible: boolean
  season: string

  discounts: any

  variants: ProductVariant[] // ✅ теперь список вариантов
  likes: Like[]
  comments: Comment[]
  cartItems: CartItem[]
  orderItems: OrderItem[]
}

export type Comment = {
  id: string
  text: string
  userId: string
  user: User
  productId: string
  hidden: boolean
  product: Product
  visible: boolean
}

export type Like = {
  id: string
  userId: string
  user: User
  productId: string
  product: Product
  rating: number
}

export type Chat = {
  id: string
  users: UserChat[]
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  userId?: string
  user?: User
}

export type UserChat = {
  id: string
  userId: string
  user: User
  chatId?: string
  chat?: Chat
}

export type Message = {
  id: string
  text: string
  userId: string
  user: User
  createdAt: Date
  updatedAt: Date
  chatId?: string
  chat?: Chat
}

export type Cart = {
  id: string
  userId: string
  user: User
  items: CartItem[]
  createdAt: Date
  updatedAt: Date
}

export type CartItem = {
  id: string
  cartId: string
  cart: Cart
  productId: string
  product: Product

  variantId: string
  variant: ProductVariant

  quantity: number
  size: string

  createdAt: Date
  updatedAt: Date
}

export type Order = {
  id: string
  userId: string
  user: User
  items: OrderItem[]
  totalPrice: number
  status: string // pending | shipped | delivered
  isReady: boolean
  deliveryMethod: string;
  isGivenToClient: boolean
  deliveryAddress?: string | null
  createdAt: Date
  updatedAt: Date
}

export type OrderItem = {
  id: string
  orderId: string
  order: Order
  productId: string
  product: Product
  variantId: string
  variant: ProductVariant
  quantity: number
  size: string

  productTitle: string
  productPrice: number
  productModel: string
  variantColor: string
}
