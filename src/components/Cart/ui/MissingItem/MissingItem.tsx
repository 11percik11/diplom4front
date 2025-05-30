import styles from './MissingItem.module.css';

interface MissingItemProps {
  missingItem: any;
  setShowAvailabilityModal: (show: boolean) => void;
}

function MissingItem({ missingItem, setShowAvailabilityModal }: MissingItemProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <h2 className={styles.title}>Ошибка наличия</h2>
        
        <div className={styles.info}>
          <p><b>Товар:</b> {missingItem.productTitle}</p>
          <p><b>Размер:</b> {missingItem.size}</p>
          <p><b>Причина:</b> {missingItem.reason}</p>
          {missingItem.requestedQuantity && missingItem.availableQuantity !== undefined && (
            <p><b>Доступно только:</b> {missingItem.availableQuantity}</p>
          )}
        </div>
        <button 
          className={styles.closeBtn} 
          onClick={() => setShowAvailabilityModal(false)}
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}

export default MissingItem;