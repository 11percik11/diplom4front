import { useState, useRef, useEffect } from "react";
// import { useGetAllUserQuery } from "../../app/userApi";
// import { useGetAllProductQuery } from "../../app/productApi";
// import { useAllCommentMutation } from "../../app/commentsApi";
import styles from "./AdminPanel.module.css";

// 🔥 Новый компонент для меню действий
export const ActionsMenu = ({
  // id,
  onEdit,
  onDelete,
}: {
  id: string;
  onEdit?: () => void;
  onDelete?: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.menuContainer} ref={menuRef}>
      <button
        className={styles.menuButton}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        ⋮
      </button>
      {isOpen && (
        <div className={styles.menu}>
          {typeof onEdit === 'function' && <button onClick={onEdit}>Редактировать</button>}
          <button onClick={onDelete}>Удалить</button>
        </div>
      )}
    </div>
  );
};