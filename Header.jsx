import React from 'react';
import { MODELS } from '../utils/helpers';
import styles from './Header.module.css';

export default function Header({ model, chatTitle }) {
  const modelInfo = MODELS.find(m => m.id === model) || MODELS[1];

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {chatTitle && (
          <span className={styles.chatTitle}>{chatTitle}</span>
        )}
      </div>
      <div className={styles.right}>
        <div className={styles.modelPill}>
          <span className={styles.modelIcon}>{modelInfo.icon}</span>
          <span className={styles.modelName}>{modelInfo.label}</span>
        </div>
      </div>
    </header>
  );
}
