import React, { useState } from "react"
import styles from "./index.module.css"
import { useNavigate } from "react-router-dom"
import {
  FiHome,
  FiUser,
  FiShoppingCart,
  // FiLogOut,
  // FiInfo,
  FiSearch,
  FiMenu,
  FiX,
  // FiFilter,
  // FiCheckCircle,
} from "react-icons/fi"
import { useDispatch } from "react-redux"
import { useLazyGetAllProductQuery } from "../../app/productApi"
import { setProducts } from "../productSlice"
// import ModelFilter from "./ModelFilter/ModelFilter"
// import { logout } from "../userSlice"

const Header: React.FC = () => {
  // const [isFilterOpen, setIsFilterOpen] = useState(false)
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [filterColor, setFilterColor] = useState("") // Новый фильтр
  const dispatch = useDispatch()
  const [triggerSearch] = useLazyGetAllProductQuery()

const handleSearch = async () => {
  localStorage.setItem("searchQuery", search); // сохраняем строку
  const response = await triggerSearch({
    search,
    color: filterColor,
  }).unwrap();

  dispatch(setProducts(response.map((p: any) => p.product ?? p)));
};

  // const hadleLogout = () => {
  //   dispatch(logout())
  //   localStorage.removeItem("token")
  //   localStorage.removeItem("dataUser")
  //   navigate("/")
  // }

  return (
    <header className={styles.header}>
      <div className={styles.topRow}>
        <div className={styles.logo} onClick={() => navigate("/")}>
          DanObuw
        </div>
        <div
          className={styles.menuToggle}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </div>
      </div>

      <div className={styles.searchBox}>
        <input
          type="text"
          className={styles.searchInput}
          onChange={e => setSearch(e.target.value)}
          placeholder="Поиск товаров..."
        />
        <div className={styles.searchButton} onClick={handleSearch}>
          <FiSearch />
        </div>
      </div>

      {/* <div
        className={`${styles.filterBox} ${localStorage.getItem("productFilters") ? styles.filterActive : ""}`}
        onClick={() => setIsFilterOpen(true)}
      >
        <FiFilter />
        <span>Фильтр</span>
        {localStorage.getItem("productFilters") && (
          <FiCheckCircle className={styles.filterIcon} />
        )}
      </div> */}

      {/* {isFilterOpen && (
        <ModelFilter
          onClose={() => setIsFilterOpen(false)}
          onApply={async filters => {
            const response = await triggerSearch({
              search,
              ...filters,
            }).unwrap()
            dispatch(setProducts(response.map((p: any) => p.product ?? p)))
            setIsFilterOpen(false)
          }}
        />
      )} */}

      <nav
        className={`${styles.navButtons} ${isMobileMenuOpen ? styles.showMenu : ""}`}
      >
        <button onClick={() => navigate("/")} className={styles.navItem}>
          <FiHome size={20} />
          <span>Главная</span>
        </button>
        <button onClick={() => navigate("/profile")} className={styles.navItem}>
          <FiUser size={20} />
          <span>Профиль</span>
        </button>
        <button onClick={() => navigate("/cart")} className={styles.navItem}>
          <FiShoppingCart size={20} />
          <span>Корзина</span>
        </button>
        {/* <button onClick={() => navigate("/about")} className={styles.navItem}>
          <FiInfo size={20} />
          <span>О нас</span>
        </button> */}
        {/* <button onClick={hadleLogout} className={styles.navItem}>
          <FiLogOut size={20} />
          <span>Выход</span>
        </button> */}
      </nav>
    </header>
  )
}

export default Header
