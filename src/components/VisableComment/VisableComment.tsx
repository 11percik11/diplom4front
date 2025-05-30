import { usePendingCommentsQuery, useModerateCommentMutation } from '../../app/commentsApi';
import styles from './VisableComment.module.css';

export default function VisableComment() {
  const { data = [], isLoading, refetch } = usePendingCommentsQuery();
  const [moderateComment] = useModerateCommentMutation();

  const handleModerate = async (id: string) => {
    try {
      await moderateComment({ id }).unwrap();
      await refetch();
    } catch (error) {
      console.error('Ошибка при модерации комментария:', error);
    }
  };

  if (isLoading) return <div className={styles.loading}>Загрузка...</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Непроверенные комментарии</h2>

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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
