import { useEffect, useState } from "react";
import Header from "../header";
import { Outlet, useNavigate } from "react-router-dom";
import styles from "./index.module.css";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../userSlice";

export const Layout = () => {
  // const [checking, setChecking] = useState(true); // ⏳ Стартовая проверка
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();

  // useEffect(() => {
  //   const checkAuth = async () => {
  //     const refreshing = localStorage.getItem("refreshing");
  //     const token = localStorage.getItem("token");

  //     // Ждём, пока refreshing пропадёт (макс. 3 секунды)
  //     if (refreshing) {
  //       for (let i = 0; i < 30; i++) {
  //         await new Promise(res => setTimeout(res, 100)); // 100мс шаг
  //         if (!localStorage.getItem("refreshing")) break;
  //       }
  //     }

  //     if (!token && !isAuthenticated) {
  //       navigate("/auther");
  //     }

  //     setChecking(false); // 🔓 Разрешаем отрисовать страницу
  //   };

  //   checkAuth();
  // }, [isAuthenticated, navigate]);

  // if (checking) return null; // Не отрисовываем, пока проверка

  return (
    <div className={styles.layout}>
      <Header />
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
};
