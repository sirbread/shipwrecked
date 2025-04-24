'use client';
import styles from './page.module.css';
import Modal from '@/components/common/Modal';
import Toast from '@/components/common/Toast';
import { useState, useEffect, useActionState } from 'react';
import { createProject } from './submit/actions';

export default function Bay() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const [state, formAction, pending] = useActionState(createProject, {
    errors: undefined,
    data: {
      name: "",
      description: "",
      hackatime: "",
      codeUrl: "",
      playableUrl: ""
    },
  });

  const [projects, setProjects] = useState([]);
  const [hackatimeProjects, setHackatimeProjects] = useState<Record<string, string>>({});

  const deleteProjectId = (index: number, id: string) => (cb: (id: string) => Promise<unknown>) => {
    cb(id).then(() => setProjects(projects.filter((_, i) => i !== index)));
  }

  async function getHackatimeProjects() {
    const response = await fetch("/api/projects?hackatime=true&slackID=U01PJ08PR7S");
    return await response.json();
  }

  // // fetch latest hackatime project when the open modal changes
  // useEffect(() => {
  //   getHackatimeProjects()
  //     .then((r: any[]) => {
  //       const formattedProjects: Record<string, string> = {};
  //       r.forEach(project => formattedProjects[project.name] = project.name);
  //       setHackatimeProjects(formattedProjects);
  //     });
  // }, [isOpenProjectModal]);

  // async function getUserProjects() {
  //   const response = await fetch("/api/projects");
  //   const data = await response.json();

  //   console.log(data[0]);
  //   setProjects(data);
  // }

  // useEffect(() => {
  //   getUserProjects();
  // }, []);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Shipwrecked Bay</h1>
        
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total Ships</span>
            <span className={styles.statValue}>0</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Ships at Sea</span>
            <span className={styles.statValue}>0</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Ships in Port</span>
            <span className={styles.statValue}>0</span>
          </div>
        </div>

        <div className={styles.actions}>
          <button 
            className={styles.modalButton}
            onClick={handleOpenModal}
          >
            Open Example Modal
          </button>
          
          <a 
            href="/bay/submit" 
            className={styles.submitLink}
          >
            Submit New Ship
          </a>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title="Example Modal"
        >
          <div className={styles.modalContent}>
            <p>This is an example modal with the following features:</p>
            <ul>
              <li>Centered on screen</li>
              <li>Backdrop blur effect</li>
              <li>Close button</li>
              <li>Custom title</li>
            </ul>
            <button 
              className={styles.submitButton}
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        </Modal>

        {showToast && (
          <Toast
            message="Form submitted successfully!"
            onClose={() => setShowToast(false)}
          />
        )}
      </div>
    </div>
  );
} 