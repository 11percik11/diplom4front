import { useEffect, useState } from "react"
import styles from "./index.module.css"
import { useCurrentQuery } from "../../app/userApi"
import { BASE_URL } from "../../constants"
import { useNavigate } from "react-router-dom"
import EditProfileModal from "../EditProfileModal"
import { FaPen } from "react-icons/fa"
// import { CiSettings } from "react-icons/ci"
// import { IoNotificationsOutline } from "react-icons/io5"
import { FiLogOut } from "react-icons/fi"
import { useDispatch } from "react-redux"
import { logout } from "../userSlice"
import {
  FiShoppingCart,
  FiBox,
  FiPackage,
  FiUsers,
  FiEdit3,
} from "react-icons/fi"
import hj from '../../foto/d29b8316-2ec3-4e57-8973-2fb5fd05c0a1.png';

const Profile = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [isModalOpen, setModalOpen] = useState(false)
  const [dataUser, setDataUser] = useState(() =>
    JSON.parse(localStorage.getItem("dataUser") || "{}"),
  )

  const { data, isLoading, isError } = useCurrentQuery()

  useEffect(() => {
    if (data && !isLoading && !isError) {
      localStorage.setItem("dataUser", JSON.stringify(data))
      setDataUser(data)
    }
  }, [data, isLoading, isError])
  const finalData = data || dataUser

  const myProduct = () => {
    navigate("/myproduct")
  }

  const openModal = () => {
    setModalOpen(true)
  }
  const closeModal = () => {
    setModalOpen(false)
  }

  const Cart = () => {
    navigate("/cart")
  }

  const hadleRegister = () => {
    navigate("/auther")
  }

  // const LogOut = () => {
  //   localStorage.removeItem("token")
  //   localStorage.removeItem("dataUser")
  //   navigate("/auther")
  // }

  const hadleLogout = () => {
    dispatch(logout())
    localStorage.removeItem("token")
    localStorage.removeItem("dataUser")
    navigate("/")
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.section}>
          <div className={styles.sectionBox}>
            <div className={styles.dsf}>
              {
                !isError &&
              <div className={styles.faPen}>
                <FaPen className={styles.pen} onClick={openModal} />
              </div> || <div></div>
              }
              <div className={styles.CiSettings}>
                <FiLogOut className={styles.CiSettingsSvg} />
                {!isError && <div onClick={hadleLogout} className={styles.SvgMarg}>Выход</div>}
                {isError && <div onClick={hadleRegister} className={styles.SvgMarg}>Войти/Регистрация</div>}
              </div>
            </div>
            <div className={styles.imageContainer}>
              <img src={finalData?.avatarUrl ? `${BASE_URL}${finalData?.avatarUrl}` : hj} alt="Product" />
            </div>
            <div className={styles.details}>
              {isError && <div>Гость</div>}
              <p>{finalData?.name}</p>
              <p>{finalData?.email}</p>
              <p>{finalData?.phone}</p>
            </div>
          </div>
          <hr />

          <div className={styles.buttonGroup}>
            <button className={styles.button} onClick={Cart}>
              <FiShoppingCart className={styles.iconLeft} />
              Корзина товара
            </button>

            <button
              className={styles.button}
              onClick={() => navigate("/orders")}
            >
              <FiBox className={styles.iconLeft} />
              Мои заказы
            </button>

            {(dataUser.role === "ADMIN" || dataUser.role === "MANAGER") && (
              <button className={styles.button} onClick={myProduct}>
                <FiPackage className={styles.iconLeft} />
                Мой товар
              </button>
            )}

            {(dataUser.role === "ADMIN" || dataUser.role === "MANAGER") && (
              <button
                className={styles.button}
                onClick={() => navigate("/commentvisable")}
              >
                <FiEdit3 className={styles.iconLeft} />
                Проверка комментариев
              </button>
            )}

            {dataUser.role === "ADMIN" && (
              <button
                className={styles.button}
                onClick={() => navigate("/adminpanel")}
              >
                <FiUsers className={styles.iconLeft} />
                Админ панель
              </button>
            )}
          </div>
        </div>
      </div>
      {isModalOpen && (
        <EditProfileModal
          data={finalData}
          onClose={closeModal}
          onProfileUpdated={setDataUser}
        />
      )}
    </>
  )
}

export default Profile
