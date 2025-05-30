import React, { useState } from 'react';
import styles from './index.module.css';
import { useCurrentQuery, useLazyCurrentQuery, useUpdateUserMutation } from '../../app/userApi';
import { useParams } from 'react-router-dom';

const EditProfileModal = ({ data, onClose, onProfileUpdated  }: any) => {
    const [updateUser] = useUpdateUserMutation();
    const [triggerCurrentQuery] = useLazyCurrentQuery()


    const [name, setName] = useState(data.name || '');
    const [phone, setPhone] = useState(data.phone || '');
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files !== null) {
            setFile(event.target.files[0]);
        }
      };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('phone', phone);
        if (file) {
            formData.append('avatar', file);
        }

        
        
        try {
            await updateUser({ userData: formData, id: data.id }).unwrap();
            const updatedData = await triggerCurrentQuery().unwrap();
            localStorage.setItem('dataUser', JSON.stringify(updatedData));
            onProfileUpdated(updatedData);
            onClose();
        } catch (error) {
            console.error('Failed to update user:', error);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>Редактировать профиль</h2>
                <form >
                    <div className={styles.formGroup}>
                        <label>Имя</label>
                        <input type="text" name="name" placeholder={name} onChange={e => setName(e.target.value)}/>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Телефон</label>
                        <input type="tel" name="phone"  placeholder={phone} onChange={e => setPhone(e.target.value)}/>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Аватар</label>
                        <input type="file" name="file" onChange={handleFileChange} required/>
                    </div>
                    <div className={styles.buttonGroup}>
                        <button className={styles.button} type="submit" onClick={handleSubmit}>Сохранить</button>
                        <button className={styles.button} type="button" onClick={onClose}>Отмена</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
