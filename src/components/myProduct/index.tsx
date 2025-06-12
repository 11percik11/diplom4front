import { useGetAllProductsForAdminQuery } from '../../app/productApi'
import styles from "./index.module.css"
import MyProductCard from '../myCardProduct'
import { CreateProduct } from '../createProduct'

export const MyProduct = () => {
  const { data, isLoading, isError, refetch } = useGetAllProductsForAdminQuery()

  return (
    <>
      <CreateProduct refetch={refetch} />
      <div className={styles.layout}>
        <div className={styles.productList}>
          {isLoading && <p>Загрузка продуктов...</p>}
          {isError && <p>Ошибка при загрузке продуктов</p>}

          {data && data.length > 0 ? (
            data.slice().reverse().map(product => (
              <MyProductCard refetch={refetch} key={product.id} product={product} />
            ))
          ) : (
            !isLoading && <p>Нет продуктов</p>
          )}
        </div>
      </div>
    </>
  )
}
