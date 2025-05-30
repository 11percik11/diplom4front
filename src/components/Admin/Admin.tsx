import { ChangeEvent, FormEvent, useState } from "react"
import styles from "./Admin.module.css"
import { useNavigate } from "react-router-dom"
import { useCreateAdminMutation } from "../../app/userApi"

interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  adminpassword: string
}

export default function Admin() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    adminpassword: "",
  })

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  })

  const navigate = useNavigate()
  const [register] = useCreateAdminMutation()

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
    const passwordValid = validatePassword()

    if (!emailValid || !passwordValid) {
      setErrors({
        email: emailValid ? "" : "Некорректный email",
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
        <h2>Регистрация админа</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Имя</label>
            <input
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
            <label htmlFor="password">Пароль</label>
            <input
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
            <label htmlFor="adminpassword">Секретный пароль</label>
            <input
              type="text"
              id="adminpassword"
              name="adminpassword"
              value={formData.adminpassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <button className={styles.submitButton} type="submit">
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
