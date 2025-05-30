import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import styles from './Activated.module.css'
import { useActivateMutation } from '../../app/userApi'

const EmailConfirmationPage = () => {
  const { id } = useParams<{ id: string }>()
  const [activate, { isLoading, isError, isSuccess }] = useActivateMutation()

  useEffect(() => {
    if (id) {
      activate({ id })
    }
  }, [id, activate])

  return (
    <div className={styles.container}>
      {isLoading && (
        <>
          <div className={`${styles.statusIcon} ${styles.success}`}>⏳</div>
          <h1 className={styles.title}>Подтверждение почты</h1>
          <p className={styles.message}>
            Идёт проверка вашего email, пожалуйста, подождите...
          </p>
        </>
      )}

      {isError && (
        <>
          <div className={`${styles.statusIcon} ${styles.error}`}>✖</div>
          <h1 className={styles.title}>Ошибка подтверждения</h1>
          <p className={styles.message}>
            Ссылка устарела или недействительна. Пожалуйста, запросите новое письмо.
          </p>
        </>
      )}

      {isSuccess && (
        <>
          <div className={`${styles.statusIcon} ${styles.success}`}>✓</div>
          <h1 className={styles.title}>Email подтверждён!</h1>
          <p className={styles.message}>
            Теперь вы можете войти в свой аккаунт и пользоваться всеми функциями.
          </p>
          <Link to="/auther" className={styles.authButton}>
            Перейти к авторизации
          </Link>
        </>
      )}
    </div>
  )
}

export default EmailConfirmationPage
