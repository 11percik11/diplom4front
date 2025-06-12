import {
  usePendingCommentsQuery,
  useModerateCommentMutation,
  useSetCommentHiddenMutation,
} from '../../app/commentsApi';
import styles from './VisableComment.module.css';
import { useState } from 'react';

export default function VisableComment() {
  const [filterHidden, setFilterHidden] = useState(false);
  const { data = [], isLoading, refetch } = usePendingCommentsQuery({ hidden: filterHidden });
  const [moderateComment] = useModerateCommentMutation();
  const [setHidden] = useSetCommentHiddenMutation();

  const handleModerate = async (id: string) => {
    try {
      await moderateComment({ id }).unwrap();
      await refetch();
    } catch (error) {
      console.error('Ошибка при модерации комментария:', error);
    }
  };

  const handleSetHidden = async (id: string, hidden: boolean) => {
    try {
      await setHidden({ id, hidden }).unwrap();
      await refetch();
    } catch (error) {
      console.error('Ошибка при обновлении hidden:', error);
    }
  };

  if (isLoading) return <div className={styles.loading}>Загрузка...</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Комментарии на модерации</h2>

      <div className={styles.filterControls}>
        <label>Показать скрытые: </label>
        <select
          value={filterHidden ? 'true' : 'false'}
          onChange={(e) => setFilterHidden(e.target.value === 'true')}
        >
          <option value="false">Нет</option>
          <option value="true">Да</option>
        </select>
      </div>

      <div className={styles.table}>
        <div className={`${styles.row} ${styles.header}`}>
          <div className={styles.cell}>Текст</div>
          <div className={styles.cell}>Пользователь</div>
          <div className={styles.cell}>ID Товара</div>
          <div className={styles.cell}>Действие</div>
        </div>

        {data.map((comment) => (
          <div className={styles.row} key={comment.id}>
            <div className={styles.cell}>{comment.text}</div>
            <div className={styles.cell}>{comment.userId}</div>
            <div className={styles.cell}>{comment.productId}</div>
            <div className={styles.cell}>
              <button
                className={styles.approveButton}
                onClick={() => handleModerate(comment.id)}
              >
                Одобрить
              </button>
              {comment.hidden ? (
                <button
                  className={styles.showButton}
                  onClick={() => handleSetHidden(comment.id, false)}
                >
                  Показать
                </button>
              ) : (
                <button
                  className={styles.rejectButton}
                  onClick={() => handleSetHidden(comment.id, true)}
                >
                  Скрыть
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
