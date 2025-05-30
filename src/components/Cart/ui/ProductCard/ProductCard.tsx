import { useState } from "react";
import {
  useLazyGetCartQuery,
  useRemoveFromCartMutation,
  useUpdateQuantityMutation,
} from "../../../../app/cart";
import { BASE_URL } from "../../../../constants";
import { MinusPlus } from "../../../PlusMinus";
import styles from "./ProductCard.module.css";
import { FiTrash2, FiCheckSquare } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  item: any;
  checkedItems: { [key: string]: boolean };
  onCheckboxChange: (itemId: string) => void;
  isGuest?: boolean;
}

export default function ProductCard({
  item,
  checkedItems,
  onCheckboxChange,
  isGuest = false,
}: ProductCardProps) {
  const [updateQuantity] = useUpdateQuantityMutation();
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [triggerCart] = useLazyGetCartQuery();
  const [removeFromCart] = useRemoveFromCartMutation();
  const navigate = useNavigate();

  const product = isGuest ? item : item.product;
  const id = isGuest ? item.productId : item.id;

  // Получение варианта товара по variantId
  const variant =
    !isGuest && product.variants?.find((v: any) => v.id === item.variantId);

  const imageUrl =
    variant?.images?.[0]?.url ||
    product.images?.[0]?.url ||
    product.images?.[0] ||
    "";

  const handleQuantityChange = async (itemId: string, newCount: number) => {
    if (isGuest) {
      const stored = localStorage.getItem("guest_cart");
      if (!stored) return;

      const parsed = JSON.parse(stored);
      const updated = parsed.map((entry: any) =>
        entry.productId === item.productId && entry.size === item.size
          ? { ...entry, quantity: newCount }
          : entry
      );

      localStorage.setItem("guest_cart", JSON.stringify(updated));
      setQuantities(prev => ({ ...prev, [itemId]: newCount }));
      return;
    }

    const action = newCount > item.quantity ? "increment" : "decrement";

    try {
      await updateQuantity({ itemId, action }).unwrap();
      setQuantities(prev => ({ ...prev, [itemId]: newCount }));
      await triggerCart();
    } catch (error) {
      console.error("Ошибка обновления количества:", error);
    }
  };

  const handleRemoveFromCart = async (itemId: string) => {
    if (isGuest) {
      const stored = localStorage.getItem("guest_cart");
      if (!stored) return;

      const parsed = JSON.parse(stored);
      const filtered = parsed.filter(
        (entry: any) =>
          !(entry.productId === item.productId && entry.size === item.size)
      );
      localStorage.setItem("guest_cart", JSON.stringify(filtered));
      window.location.reload();
      return;
    }

    try {
      await removeFromCart({ itemId }).unwrap();
      await triggerCart();
    } catch (error) {
      console.error("Ошибка при удалении товара:", error);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.left}>
        <img
          onClick={() => navigate(`/product/${product.id}?color=${variant?.color}`)}
          src={`${BASE_URL}${imageUrl}`}
          alt={product.title}
          className={styles.image}
        />
      </div>

      <div className={styles.center}>
        <div className={styles.header}>
          <div className={styles.titleBlock}>
            <div
              onClick={() => navigate(`/product/${product.id}?color=${variant?.color}`)}
              className={styles.title}
            >
              {product.title}
            </div>
            <div className={styles.description}>{product.description}</div>
            <div className={styles.size}>Размер: {item.size}</div>
            {!isGuest && variant?.color && (
              <div className={styles.size}>Цвет: {variant.color}</div>
            )}
          </div>

          <div className={styles.rightTop}>
            <div className={styles.price}>{product.price} ₽</div>

            <button
              onClick={() => handleRemoveFromCart(id)}
              className={styles.iconButton}
              title="Удалить товар"
            >
              <FiTrash2 size={24} />
            </button>

            {!isGuest && (
              <label className={styles.checkboxWrapper}>
                <input
                  type="checkbox"
                  checked={checkedItems[id] || false}
                  onChange={() => onCheckboxChange(id)}
                  className={styles.checkbox}
                />
                <FiCheckSquare
                  size={24}
                  className={
                    checkedItems[id]
                      ? styles.checkedIcon
                      : styles.uncheckedIcon
                  }
                />
              </label>
            )}
          </div>
        </div>

        <div className={styles.controls}>
          <MinusPlus
            count={quantities[id] || item.quantity}
            onChange={newCount => handleQuantityChange(id, newCount)}
          />
        </div>
      </div>
    </div>
  );
}
