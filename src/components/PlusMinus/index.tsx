import styles from "./index.module.css"
import { FaMinus, FaPlus } from "react-icons/fa"
import { useState, useEffect, useRef } from "react"

type MinusPlusProps = {
  count: number
  onChange: (newCount: number) => void
}

export const MinusPlus = ({ count, onChange }: MinusPlusProps) => {
  const [isHoldingMinus, setIsHoldingMinus] = useState(false)
  const [isHoldingPlus, setIsHoldingPlus] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const handleMinus = () => {
    if (count > 1) {
      onChange(count - 1)
    }
  }

  const handlePlus = () => {
    onChange(count + 1)
  }

  // Обработчик для начала удержания кнопки
  const startHold = (isMinus: boolean) => {
    if (isMinus) {
      setIsHoldingMinus(true)
      handleMinus() // Немедленное действие при нажатии
    } else {
      setIsHoldingPlus(true)
      handlePlus() // Немедленное действие при нажатии
    }
  }

  // Обработчик для отпускания кнопки
  const endHold = (isMinus: boolean) => {
    if (isMinus) {
      setIsHoldingMinus(false)
    } else {
      setIsHoldingPlus(false)
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useEffect(() => {
    if (isHoldingMinus || isHoldingPlus) {
      intervalRef.current = setInterval(() => {
        if (isHoldingMinus) {
          handleMinus()
        } else if (isHoldingPlus) {
          handlePlus()
        }
      }, 100) // Интервал 100мс для быстрого изменения
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isHoldingMinus, isHoldingPlus, count])

  return (
    <div className={styles.container}>
      <button
        className={styles.button}
        onMouseDown={() => startHold(true)}
        onMouseUp={() => endHold(true)}
        onMouseLeave={() => endHold(true)} // Если курсор ушел с кнопки
        onTouchStart={() => startHold(true)}
        onTouchEnd={() => endHold(true)}
      >
        <FaMinus />
      </button>
      <span className={styles.count}>{count}</span>
      <button
        className={styles.button}
        onMouseDown={() => startHold(false)}
        onMouseUp={() => endHold(false)}
        onMouseLeave={() => endHold(false)} // Если курсор ушел с кнопки
        onTouchStart={() => startHold(false)}
        onTouchEnd={() => endHold(false)}
      >
        <FaPlus />
      </button>
    </div>
  )
}
