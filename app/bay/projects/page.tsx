'use client';
import Link from 'next/link';
import styles from '../page.module.css';
import ProgressBar from '@/components/common/ProgressBar';
import Modal from '@/components/common/Modal';
import Toast from '@/components/common/Toast';
import { useState, useEffect, useActionState } from 'react';
import { Project } from '@/components/common/Project';
import FormSelect from '@/components/form/FormSelect';
import FormInput from '@/components/form/FormInput';
import { createProject } from '../submit/actions';

export default function BayPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('info');
  const [isOpenProjectModal, setIsOpenProjectModal] = useState<boolean>(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToastMessage(message);
    setToastType(type);
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

  // fetch latest hackatime project when the open modal changes
  useEffect(() => {
    getHackatimeProjects()
      .then((r: any[]) => {
        const formattedProjects: Record<string, string> = {};
        r.forEach(project => formattedProjects[project.name] = project.name);
        setHackatimeProjects(formattedProjects);
      });
  }, [isOpenProjectModal]);

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
      <h1 className={styles.title}>Your projects</h1>
      
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

      <button
          className={styles.toastButton}
          onClick={() => setIsOpenProjectModal(true)}
        >
          Add Project
      </button>

      <Modal
        isOpen={isOpenProjectModal}
        onClose={() => setIsOpenProjectModal(false)}
        title="Create a new project"
        okText="Done"
      >
        <form action={formAction}>
          <FormInput
            fieldName='name'
            placeholder='Project Name'
            state={state}
            required
          >
            Project Name
          </FormInput>
          <FormInput
            fieldName='description'
            placeholder='Description'
            state={state}
            required
          >
            Description
          </FormInput>
          <FormInput
            fieldName='codeUrl'
            placeholder='Code URL'
            state={state}
            required
          >
            Code URL
          </FormInput>
          <FormInput
            fieldName='playableUrl'
            placeholder='Playable URL'
            state={state}
          >
            Playable URL
          </FormInput>
          <FormSelect 
            fieldName='hackatime'
            placeholder='Your Hackatime Projects'
            required
            values={hackatimeProjects}>
              Your Hackatime Project
            </FormSelect>
          <button
            type="submit"
            className="mt-4 focus:outline-2 px-4 w-24 py-2 bg-indigo-500 hover:bg-indigo-700 hover:underline hover:font-bold rounded text-white self-center"
            disabled={pending}
          >
            Ship!
          </button>

        </form>
      </Modal>


      {projects.map((project: any, index: number) => (
        <Project key={index} 
          deleteHandler={deleteProjectId(index, project.id)}
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