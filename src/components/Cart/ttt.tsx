// import React, { useState, useEffect } from "react"
// import styles from "./index.module.css"
// import {
//   useGetCartQuery,
//   useLazyGetCartQuery,
//   useRemoveFromCartMutation,
//   useUpdateQuantityMutation,
// } from "../../app/cart"
// import { BASE_URL } from "../../constants"
// import { MinusPlus } from "../PlusMinus"
// import { CartItem } from "../../app/types"
// import { useCreateOrderMutation } from "../../app/orders"

// const CartPage = () => {
//   const [removeFromCart] = useRemoveFromCartMutation()
//   const [triggerCart] = useLazyGetCartQuery()
//   const [updateQuantity] = useUpdateQuantityMutation()
//   const [value, setValue] = useState<number>(0)
//   const [payModelShow, setPayModelShow] = useState(false)
//   const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>(
//     {},
//   )
//   const [createOrder] = useCreateOrderMutation()
//   const [isChecked, setIsChecked] = useState<boolean>(false)
//   const [quantities, setQuantities] = useState<{ [key: string]: number }>({})

//   const { data: cart, isLoading } = useGetCartQuery()

//   useEffect(() => {
//     if (cart?.items) {
//       const initialQuantities = cart.items.reduce(
//         (acc, item) => {
//           acc[item.id] = item.quantity
//           return acc
//         },
//         {} as { [key: string]: number },
//       )
//       setQuantities(initialQuantities)
//     }
//   }, [cart])

//   useEffect(() => {
//     if (cart?.items) {
//       const totalValue = cart.items.reduce((sum, item) => {
//         return checkedItems[item.id]
//           ? sum + item.product.price * (quantities[item.id] || item.quantity)
//           : sum
//       }, 0)
//       setValue(totalValue)
//     }
//   }, [cart, checkedItems, quantities])

//   useEffect(() => {
//     if (cart?.items && cart.items.length > 0) {
//       const allChecked = cart.items.every(item => checkedItems[item.id])
//       setIsChecked(allChecked)
//     } else {
//       setIsChecked(false)
//     }
//   }, [checkedItems, cart])

//   const handleRemoveFromCart = async (itemId: string) => {
//   try {
//     await removeFromCart({ itemId }).unwrap();
//     await triggerCart();
//   } catch (error) {
//     console.error("Ошибка при удалении товара:", error);
//   }
// };

//   const handleCheckboxChange = (itemId: string) => {
//     setCheckedItems(prev => ({
//       ...prev,
//       [itemId]: !prev[itemId],
//     }))
//   }

//   useEffect(() => {
//   document.body.style.overflow = payModelShow ? 'hidden' : 'auto'
//   return () => {
//     document.body.style.overflow = 'auto'
//   }
// }, [payModelShow])

//   const handleSelectAllChange = () => {
//     if (cart?.items) {
//       const newCheckedState = !isChecked
//       const updatedCheckedItems = cart.items.reduce(
//         (acc, item) => {
//           acc[item.id] = newCheckedState
//           return acc
//         },
//         {} as { [key: string]: boolean },
//       )

//       setCheckedItems(updatedCheckedItems)
//       setIsChecked(newCheckedState)
//     }
//   }

//   const handleQuantityChange = async (itemId: string, newCount: number) => {
//   const currentQuantity = quantities[itemId] || 1;
//   const action = newCount > currentQuantity ? "increment" : "decrement";

//   try {
//     await updateQuantity({ itemId, action }).unwrap();
//     setQuantities(prev => ({ ...prev, [itemId]: newCount }));
//     await triggerCart();
//   } catch (error) {
//     console.error("Ошибка обновления количества:", error);
//   }
// };

//   if (isLoading) return <div className={styles.loading}>Загрузка...</div>

//   const handlePayment = async () => {
//     const selectedItems = cart?.items
//       .filter(item => checkedItems[item.id])
//       .map(item => ({
//         productId: item.productId,
//         quantity: quantities[item.id] || item.quantity,
//         size: item.size,
//       }))

//     localStorage.setItem("pendingOrder", JSON.stringify(selectedItems))
//     setPayModelShow(true)
//     try {
//       const response = await fetch(`${BASE_URL}/api/create-payment`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           amount: Number(value),
//           description: "Оплата товаров в корзине",
//         }),
//       })

//       const data = await response.json()

//       if (data.confirmation && data.confirmation.confirmation_token) {
//         const checkout = new (window as any).YooMoneyCheckoutWidget({
//           confirmation_token: data.confirmation.confirmation_token,
//           return_url: "http://localhost:5173/payment-complete",

//           onComplete: function () {
//             console.log('sadsadsadwewewefewwf223323232');
            
//             handleSuccessfulPayment()
//           },

//           error_callback: (error: any) => {
//             console.error("Ошибка оплаты:", error)
//           },
//         })

//         const paymentForm = document.getElementById("payment-form")
//         if (paymentForm) {
//           paymentForm.innerHTML = "" // Очистить предыдущий виджет
//         }
//         checkout.render("payment-form")
//       } else {
//         console.error("Не удалось получить токен подтверждения", data)
//       }
//     } catch (error) {
//       console.error("Ошибка при создании платежа:", error)
//     }
//   }

//   const handleSuccessfulPayment = async () => {
//     if (!cart?.items) return
//     const selectedItems = cart.items
//       .filter(item => checkedItems[item.id])
//       .map(item => ({
//         productId: item.productId,
//         quantity: quantities[item.id] || item.quantity,
//         size: item.size, 
//       }))

//     if (selectedItems.length === 0) return

//     try {
//       await createOrder({ items: selectedItems }).unwrap()
//       console.log("Заказ создан успешно!")
//       setPayModelShow(false)
//     } catch (error) {
//       console.error("Ошибка при создании заказа:", error)
//     }
//   }


//   return (
//     <div className={styles.cartPage}>
//       <div className={styles.CartPageBox}>
//         <div className={styles.CartPageBoxDisp}>
//           <div className={styles.CartPageInput}>
//             <input
//               className={styles.checkboxStyled}
//               type="checkbox"
//               checked={isChecked}
//               onChange={handleSelectAllChange}
//             />
//             <div className={styles.selectAllText}>Выбрать всё</div>
//           </div>

//           <div className={styles.cartItems}>
//             {cart?.items.map(item => (
//               <div key={item.id} className={styles.productCard}>
//                 <div className={styles.imageWrapper}>
//                   <img
//                     className={styles.imgProduct}
//                     src={`${BASE_URL}${item.product.avatarUrl}`}
//                     alt={item.product.title}
//                   />
//                 </div>
//                 <div className={styles.productDetails}>
//                   <div className={styles.productTitle}>
//                     {item.product.title}
//                   </div>
//                   <div className={styles.productDescription}>
//                     {item.product.description}
//                   </div>
//                   <div>
//                     Размер: {item.size}
//                   </div>
//                   <div className={styles.price}>{item.product.price} ₽</div>
//                   <div className={styles.boxPlus}>
//                     <MinusPlus
//                       count={quantities[item.id] || item.quantity}
//                       onChange={newCount =>
//                         handleQuantityChange(item.id, newCount)
//                       }
//                     />
//                   </div>
//                   <button
//                     className={styles.removeButton}
//                     // onClick={() => handleRemoveFromCart(item.productId)}
//                     onClick={() => handleRemoveFromCart(item.id)}
//                   >
//                     Удалить
//                   </button>
//                 </div>
//                 <div className={styles.checkboxPlus}>
//                   <input
//                     className={styles.checkboxStyled}
//                     type="checkbox"
//                     checked={checkedItems[item.id] || false}
//                     onChange={() => handleCheckboxChange(item.id)}
//                   />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className={styles.cartSummary}>
//           <form className={styles.formContainer}>
//             <div className={styles.CartPrice}>
//               <div>Итого:</div>
//               <div>{value} ₽</div>
//             </div>
//             <button
//               type="button"
//               className={styles.orderButton}
//               onClick={handlePayment}
//               disabled={value === 0}
//             >
//               Заказать
//             </button>
//           </form>
//         </div>
//       </div>

//       <div
//         className={`${styles.payModel} ${!payModelShow && styles.visablePay}`}
//       >
//         <div className={styles.containerPay}>
//           <div className={styles.padding} id="payment-form"></div>
//           <button
//             className={styles.buttonPayOff}
//             onClick={() => setPayModelShow(false)}
//           >
//             Отменить
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default CartPage
