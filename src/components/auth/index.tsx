import React, { useState, ChangeEvent, FormEvent } from "react"
import styles from "./index.module.css"
import { useLoginMutation } from "../../app/userApi"
import { useNavigate } from "react-router-dom"
import { useAuthGuard } from "../../hooks/useAuthGuard"

interface LoginData {
  email: string
  password: string
}

const LoginForm: React.FC = () => {
  const [loginError, setLoginError] = useState("")
  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    password: "",
  })

  useAuthGuard()

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLoginData({
      ...loginData,
      [name]: value,
    })
    setLoginError("") // сброс ошибки при вводе
  }

  const [login] = useLoginMutation()
  const navigate = useNavigate()
  // const [triggerCurrentQuery] = useLazyCurrentQuery()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log("Login Data:", loginData)
    try {
      await login(loginData).unwrap()
      // await triggerCurrentQuery()
      navigate("/")
    } catch (err) {
      setLoginData({ email: "", password: "" })
      setLoginError("Неверный email или пароль") // <- сообщение
      console.log(err)
    }
  }

  const handleRegister = () => {
    navigate("/register")
  }

  return (
    <div className={styles.formWrapper}>
      <div className={styles.formContainer}>
        <h2 className={styles.header}>Авторизация</h2>
        {loginError && <div className={styles.errorMessage}>{loginError}</div>}
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={loginData.email}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Пароль
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={loginData.password}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <button type="submit" className={styles.button}>
              Войти
            </button>
          </div>
        </form>
        <button
          type="button"
          className={styles.buttonAlt}
          onClick={handleRegister}
        >
          Зарегистрироваться
        </button>
      </div>
    </div>
  )
}

export default LoginForm
