import React from "react";
import styles from "./index.module.css";
import { BASE_URL } from "../../constants";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }: any) => {
  const navigate = useNavigate();
  const [isAdded, setIsAdded] = React.useState(false);

  const goToProduct = () => {
  const variantColor = product.variants?.[0]?.color
  navigate(`/product/${product.id}?color=${encodeURIComponent(variantColor)}`)
}

  // Берём первый вариант товара (если есть)
  const firstVariant = product.variants?.[0];
  const firstImage = firstVariant?.images?.[0]?.url;

  return (
    <div className={styles.card}>
      <div className={styles.imageBox} onClick={goToProduct}>
        {firstImage ? (
          <img
            className={styles.productImage}
            src={`${BASE_URL}${firstImage}`}
            alt={product.title}
          />
        ) : (
          <div className={styles.noImage}>Нет изображения</div>
        )}
      </div>

      <div className={styles.titleButton} onClick={goToProduct}>
        <h3 className={styles.title}>{product.title}</h3>
      </div>

      <div className={styles.details}>
        <div className={styles.priceText}>{product.price} ₽</div>
        <p className={styles.description}>{product.description}</p>
      </div>

      <button
        className={`${styles.cartButton} ${isAdded ? styles.added : ""}`}
        onClick={goToProduct}
        disabled={isAdded}
      >
        {isAdded ? "Товар добавлен в корзину" : "Посмотреть товар"}
      </button>
    </div>
  );
};

export default ProductCard;
