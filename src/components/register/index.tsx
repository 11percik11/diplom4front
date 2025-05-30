import React, { useState, ChangeEvent, FormEvent } from "react"
import styles from "./index.module.css"
import { useRegisterMutation } from "../../app/userApi"
import { useNavigate } from "react-router-dom"

interface FormData {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

  const validatePhone = (phone: string) => {
    const digitsOnly = phone.replace(/\D/g, "") // Убираем все нецифры
    return digitsOnly.length === 11
  }

  const [errors, setErrors] = useState({
    email: "",
    phone: "",
    password: "",
  })

  const navigate = useNavigate()
  const [register] = useRegisterMutation()

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }


  const validateEmail = (email: string) => {
  const emailRegex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}
  const validatePassword = () => {
    return (
      formData.password === formData.confirmPassword &&
      formData.password.length >= 8
    )
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const emailValid = validateEmail(formData.email)
    const phoneValid = validatePhone(formData.phone)
    const passwordValid = validatePassword()

    if (!emailValid || !phoneValid || !passwordValid) {
      setErrors({
        email: emailValid ? "" : "Некорректный email",
        phone: phoneValid ? "" : "Некорректный номер телефона",
        password: !passwordValid
          ? formData.password !== formData.confirmPassword
            ? "Пароли не совпадают"
            : "Пароль должен быть не менее 8 символов"
          : "",
      })
      return
    }

    try {
      await register(formData).unwrap()
      navigate("/auther")
    } catch (err) {
      console.log(err)
    }
  }

  const handleLogin = () => {
    navigate("/auther")
  }

  return (
    <div className={styles.formWrapper}>
      <div className={styles.formContainer}>
        <h2>Регистрация</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Имя</label>
            <input
              className={styles.input}
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              className={styles.input}
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <div className={styles.error}>{errors.email}</div>}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="phone">Телефон</label>
            <input
              className={styles.input}
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            {errors.phone && <div className={styles.error}>{errors.phone}</div>}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Пароль</label>
            <input
              className={styles.input}
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Подтвердите пароль</label>
            <input
              className={styles.input}
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            {errors.password && (
              <div className={styles.error}>{errors.password}</div>
            )}
          </div>
          <div className={styles.formGroup}>
            <button className={styles.button} type="submit">
              Зарегистрироваться
            </button>
          </div>
        </form>
        <button
          type="button"
          className={styles.buttonAlt}
          onClick={handleLogin}
        >
          Войти
        </button>
      </div>
    </div>
  )
}

export default Register
