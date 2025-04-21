'use client';
import Link from 'next/link';
import styles from './page.module.css';
import ProgressBar from '@/components/common/ProgressBar';
import Modal from '@/components/common/Modal';
import Toast from '@/components/common/Toast';
import { useState, useEffect } from 'react';
import { Project } from '@/components/common/Project';

export default function BayPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('info');

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToastMessage(message);
    setToastType(type);
  };

  const [projects, setProjects] = useState([]);
  async function getUserProjects() {
    const response = await fetch("/api/projects");
    const data = await response.json();

    console.log(data[0]);
    setProjects(data);
  }

  useEffect(() => {
    getUserProjects();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome to the Bay!</h1>
      
      <div className={styles.progressSection}>
        <h2>Progress Bar Examples</h2>
        <p className={styles.description}>
          Below are examples of our skinnable progress bars in different states and colors:
        </p>
        <div style={{ maxWidth: '400px' }}>
          <ProgressBar 
            value={75} 
            label="Success Variant (75%)"
            variant="success"
            height={8}
          />
          <ProgressBar 
            value={30} 
            label="Warning Variant (30%)"
            variant="warning"
            height={8}
          />
          <ProgressBar 
            value={90} 
            label="Error Variant (90%)"
            variant="error"
            height={8}
          />
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.modalButton}
          onClick={() => setIsModalOpen(true)}
        >
          Open Example Modal
        </button>
        <Link href="/submit" className={styles.submitButton}>
          Submit Your Project
        </Link>
        <button
          className={styles.toastButton}
          onClick={() => showToast('This is an example toast notification!', 'success')}
        >
          Show Toast Example
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Example Modal"
        okText="Got it!"
      >
        <p>This is an example modal that demonstrates the following features:</p>
        <ul className={styles.modalList}>
          <li>Custom title and button text</li>
          <li>Click outside to close</li>
          <li>Escape key to close</li>
          <li>Accessible focus management</li>
          <li>Smooth animations</li>
        </ul>
      </Modal>

      {projects.map((project: any, index: number) => (
        <Project key={index} 
          {...project}
        />
      ))}

      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
} 