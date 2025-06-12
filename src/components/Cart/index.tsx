import { useState, useEffect } from "react"
import styles from "./index.module.css"
import {
  useAddToCartMutation,
  useGetCartQuery,
  useLazyGetCartQuery,
} from "../../app/cart"
import {
  BASE_URL,
  //  BASE_URLPay
} from "../../constants"
import {
  useCheckProductAvailabilityMutation,
  useCreateOrderMutation,
} from "../../app/orders"
import ProductCard from "./ui/ProductCard/ProductCard"
import MissingItem from "./ui/MissingItem/MissingItem"
import { useNavigate } from "react-router-dom"

type MissingItem = {
  productId: string
  productTitle?: string
  size?: string
  requestedQuantity?: number
  availableQuantity?: number
  reason: string
}

const CartPage = () => {
  const [value, setValue] = useState<number>(0)
  const [payModelShow, setPayModelShow] = useState(false)
  const navigate = useNavigate()
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>(
    {},
  )
  const [triggerCart] = useLazyGetCartQuery()
  const [createOrder] = useCreateOrderMutation()
  const [isChecked, setIsChecked] = useState<boolean>(false)
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({})
  const [availabilityError, setAvailabilityError] = useState<
    MissingItem | string | null
  >(null)
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false)
  const [checkProductAvailability] = useCheckProductAvailabilityMutation()
  const [missingItem, setMissingItem] = useState<{
    productTitle?: string
    size?: string
    requestedQuantity?: number
    availableQuantity?: number
    reason: string
  } | null>(null)
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "courier">(
    "pickup",
  )
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [addressError, setAddressError] = useState(false)
  const [guestCartItems, setGuestCartItems] = useState<
    { productId: string; variantId: string; size: string; quantity: number }[]
  >([])
  const token = localStorage.getItem("token")
  const isAuthenticated = !!token
  const [showLoginModal, setShowLoginModal] = useState(false)

  const { data: cart, isLoading } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  })

  const [addToCart] = useAddToCartMutation()

  useEffect(() => {
    if (isAuthenticated && guestCartItems.length > 0) {
      const migrateCart = async () => {
        try {
          for (const item of guestCartItems) {
            await addToCart({
              productId: item.productId,
              variantId: item.variantId,
              size: item.size,
              quantity: item.quantity,
            }).unwrap()
          }
          localStorage.removeItem("guest_cart")
          setGuestCartItems([])
          await triggerCart()

          console.log("Гостевая корзина перенесена в серверную")
        } catch (err) {
          console.error("Ошибка при миграции корзины:", err)
        }
      }

      migrateCart()
    }
  }, [isAuthenticated, guestCartItems])

  useEffect(() => {
    if (cart?.items) {
      const initialQuantities = cart.items.reduce(
        (acc, item) => {
          acc[item.id] = item.quantity
          return acc
        },
        {} as { [key: string]: number },
      )
      setQuantities(initialQuantities)
    }
  }, [cart])

  useEffect(() => {
    const storedCart = localStorage.getItem("guest_cart")
    if (storedCart) {
      try {
        const parsed = JSON.parse(storedCart)
        if (Array.isArray(parsed)) {
          setGuestCartItems(parsed)
        }
      } catch (e) {
        console.error("Ошибка чтения guest_cart из localStorage:", e)
      }
    }
  }, [])

useEffect(() => {
  if (cart?.items) {
    const totalValue = cart.items.reduce((sum, item) => {
      if (!checkedItems[item.id]) return sum;

      const quantity = quantities[item.id] || item.quantity;
      const now = new Date();

      const variantDiscounts =
        item.product?.variants?.find(v => v.id === item.variantId)?.discounts || [];

      const productDiscounts = item.product?.discounts || [];

      const activeDiscounts = [...variantDiscounts, ...productDiscounts].filter(
        d => new Date(d.startsAt) <= now && new Date(d.endsAt) >= now
      );

      const maxDiscount =
        activeDiscounts.length > 0
          ? Math.max(...activeDiscounts.map(d => d.percentage))
          : 0;

      // ✅ Округляем цену за единицу
      const discountedUnitPrice = Math.floor(item.product.price * (1 - maxDiscount / 100));

      // ✅ И только потом умножаем
      return sum + discountedUnitPrice * quantity;
    }, 0);

    setValue(totalValue);
  }
}, [cart, checkedItems, quantities]);

  useEffect(() => {
    if (cart?.items && cart.items.length > 0) {
      const allChecked = cart.items.every(item => checkedItems[item.id])
      setIsChecked(allChecked)
    } else {
      setIsChecked(false)
    }
  }, [checkedItems, cart])

  const handleCheckboxChange = (itemId: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId],
    }))
  }

  useEffect(() => {
    document.body.style.overflow = payModelShow ? "hidden" : "auto"
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [payModelShow])

  const handleSelectAllChange = () => {
    if (cart?.items) {
      const newCheckedState = !isChecked
      const updatedCheckedItems = cart.items.reduce(
        (acc, item) => {
          acc[item.id] = newCheckedState
          return acc
        },
        {} as { [key: string]: boolean },
      )

      setCheckedItems(updatedCheckedItems)
      setIsChecked(newCheckedState)
    }
  }

  if (isLoading) return <div className={styles.loading}>Загрузка...</div>

  const handlePayment = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }

    if (value === 0) {
      return
    }

    const selectedItems = cart?.items
      .filter(item => checkedItems[item.id])
      .map(item => ({
        productId: item.productId, // добавляем!
        variantId: item.variantId, // обязательно для обновлённой схемы
        quantity: quantities[item.id] || item.quantity,
        size: item.size,
      }))

    if (!selectedItems || selectedItems.length === 0) {
      alert("Выберите товары для заказа")
      return
    }

    if (deliveryMethod === "courier" && deliveryAddress.trim() === "") {
      setAddressError(true)
      return
    } else {
      setAddressError(false)
    }

    try {
      const result = await checkProductAvailability({
        items: selectedItems,
      }).unwrap()

      if (!result.available && result.missingItem) {
        setMissingItem(result.missingItem)
        setShowAvailabilityModal(true)
        return
      }

      localStorage.setItem(
        "pendingOrder",
        JSON.stringify({
          items: selectedItems,
          deliveryMethod,
          deliveryAddress:
            deliveryMethod === "courier" ? deliveryAddress : undefined,
        }),
      )

      const paymentResponse = await fetch(`${BASE_URL}/api/create-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(value),
          description: "Оплата товаров в корзине",
        }),
      })
      const data = await paymentResponse.json()

      if (data.confirmation && data.confirmation.confirmation_token) {
        const checkout = new (window as any).YooMoneyCheckoutWidget({
          confirmation_token: data.confirmation.confirmation_token,
          return_url: `http://localhost:5173/payment-complete`,
          onComplete: () => handleSuccessfulPayment(),
          error_callback: (error: any) => {
            console.error("Ошибка оплаты:", error)
          },
        })

        const paymentForm = document.getElementById("payment-form")
        if (paymentForm) {
          paymentForm.innerHTML = ""
        }
        checkout.render("payment-form")
        setPayModelShow(true)
      } else {
        alert("Не удалось начать оплату")
      }
    } catch (error: any) {
      console.error("Ошибка проверки или оплаты:", error)
      setAvailabilityError(error?.data?.error || "Ошибка проверки товаров")
      setShowAvailabilityModal(true)
    }
  }

  const handleSuccessfulPayment = async () => {
    if (!cart?.items) return
    const selectedItems = cart.items
      .filter(item => checkedItems[item.id])
      .map(item => ({
        productId: item.productId,
        variantId: item.variantId, // добавляем!
        quantity: quantities[item.id] || item.quantity,
        size: item.size,
      }))

    if (selectedItems.length === 0) return

    try {
      await createOrder({
        items: selectedItems,
        deliveryMethod,
        deliveryAddress:
          deliveryMethod === "courier" ? deliveryAddress : undefined,
      }).unwrap()
      console.log("Заказ создан успешно!")
      setPayModelShow(false)
    } catch (error) {
      console.error("Ошибка при создании заказа:", error)
    }
  }

  return (
    <div className={styles.cartPage}>
      <div className={styles.CartPageBox}>
        <div className={styles.CartPageBoxDisp}>
          <div className={styles.CartPageInput}>
            <input
              className={styles.checkboxStyled}
              type="checkbox"
              checked={isChecked}
              onChange={handleSelectAllChange}
            />
            <div className={styles.selectAllText}>Выбрать всё</div>
          </div>

          <div className={styles.cartItems}>
            {isAuthenticated
              ? cart?.items.map(item => (
                  <ProductCard
                    key={item.id}
                    checkedItems={checkedItems}
                    onCheckboxChange={handleCheckboxChange}
                    item={item}
                  />
                ))
              : guestCartItems.map((item, index) => (
                  <ProductCard
                    key={index}
                    item={item}
                    isGuest={true}
                    checkedItems={checkedItems}
                    onCheckboxChange={() => {}} // можешь настроить гостевой чекбокс позже
                  />
                ))}

            {showAvailabilityModal && missingItem && (
              <MissingItem
                setShowAvailabilityModal={setShowAvailabilityModal}
                missingItem={missingItem}
              />
            )}
          </div>
        </div>

        <div className={styles.cartSummary}>
          <form className={styles.formContainer}>
            <div className={styles.CartPrice}>
              <div>Итого:</div>
              <div>{value.toLocaleString()} ₽</div>
            </div>
            <button
              type="button"
              className={styles.orderButton}
              onClick={handlePayment}
              // disabled={value === 0}
            >
              Заказать
            </button>
            <div className={styles.deliveryMethod}>
              <label>
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="pickup"
                  checked={deliveryMethod === "pickup"}
                  onChange={() => setDeliveryMethod("pickup")}
                />
                Самовывоз
              </label>
              <label>
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="courier"
                  checked={deliveryMethod === "courier"}
                  onChange={() => setDeliveryMethod("courier")}
                />
                Доставка по адресу
              </label>
            </div>
            {deliveryMethod === "pickup" && (
              <div className={styles.pickupAddress}>
                <span>По адресу: </span>
                <a
                  href="https://yandex.ru/maps/?text=Ижевск, Улица Холмогорова, 16"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Улица Холмогорова, 16, Ижевск
                </a>
              </div>
            )}
            {deliveryMethod === "courier" && (
              <div className={styles.addressInput}>
                <label>
                  Адрес доставки:
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={e => {
                      setDeliveryAddress(e.target.value)
                      if (e.target.value.trim() !== "") {
                        setAddressError(false)
                      }
                    }}
                    placeholder="Введите адрес"
                    required
                    className={addressError ? styles.inputError : ""}
                  />
                </label>
                {addressError && (
                  <div className={styles.errorText}>Введите адрес доставки</div>
                )}
              </div>
            )}
          </form>
        </div>
      </div>

      <div
        className={`${styles.payModel} ${!payModelShow && styles.visablePay}`}
      >
        <div className={styles.containerPay}>
          <div className={styles.padding} id="payment-form"></div>
          <button
            className={styles.buttonPayOff}
            onClick={() => setPayModelShow(false)}
          >
            Отменить
          </button>
        </div>
      </div>
      {showLoginModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <h3>Войдите в аккаунт</h3>
            <p>
              Чтобы оформить заказ, необходимо войти или зарегистрироваться.
            </p>
            <button
              onClick={() => {
                setShowLoginModal(false)
                navigate("/auther") // или через useNavigate("/login")
              }}
            >
              Перейти к входу
            </button>
            <button
              className={styles.cancelButton}
              onClick={() => setShowLoginModal(false)}
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CartPage
