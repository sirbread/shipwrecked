'use client';
import styles from './page.module.css';
import Modal from '@/components/common/Modal';
import Toast from '@/components/common/Toast';
import { useState, useEffect, useActionState } from 'react';
import { createProjectAction, FormSave } from './submit/actions';
import { Project } from '@/components/common/Project';
import FormSelect from '@/components/form/FormSelect';
import FormInput from '@/components/form/FormInput';
import { useSession } from 'next-auth/react';
import { Toaster, toast } from "sonner";

export default function Bay() {
  const { data: session, status } = useSession();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('info');
  const [isOpenProjectModal, setIsOpenProjectModal] = useState<boolean>(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToastMessage(message);
    setToastType(type);
  };

  const [state, formAction, pending] = useActionState((state: FormSave, payload: FormData) => new Promise<FormSave>((resolve, reject) => {
    toast.promise(createProjectAction(state, payload), {
      loading: "Creating project...",
      error: () => { reject(); return "Failed to create new project" },
      success: data => {
        resolve(data as FormSave);
        return "Created new project"
      }
    });
  }), {
    errors: undefined,
    data: {
      name: "",
      description: "",
      hackatime: "",
      codeUrl: "",
      playableUrl: "",
      screenshot: "",
      userId: ""
    },
  });

  // Update userId when session changes
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const userId = (session.user as any).id;
      if (userId && state.data) {
        state.data.userId = userId;
      }
    }
  }, [session, status]);

  const [projects, setProjects] = useState([]);
  const [hackatimeProjects, setHackatimeProjects] = useState<Record<string, string>>({});

  const deleteProjectId = (index: number, projectID: string, userId: string) => (cb: (projectID: string, userId: string) => Promise<unknown>) => {
    cb(projectID, userId).then(() => setProjects(projects.filter((_, i) => i !== index)));
  }

  async function getHackatimeProjects() {
    const response = await fetch("/api/projects?hackatime=true&slackID=U01PJ08PR7S");
    return await response.json();
  }

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
    setProjects(data);
  }

  useEffect(() => {
    getUserProjects();
  }, []);  
  
  if (status === "loading") return <>Loading...</>
  if (status === "unauthenticated") return <>Access Denied! <a className="underline text-blue-500" href="/api/auth/signin">Sign In</a></>


  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Shipwrecked Bay</h1>
        
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total Ships</span>
            <span className={styles.statValue}>{projects.length}</span>
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
            onClick={() => setIsOpenProjectModal(true)}
          >
            Add Project
          </button>
          
          <a 
            href="/bay/submit" 
            className={styles.submitLink}
          >
            Submit New Ship
          </a>
        </div>

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
              placeholder='Playable URL (optional)'
              state={state}
            >
              Playable URL (optional)
            </FormInput>
            <FormInput
              fieldName='screenshot'
              placeholder='Screenshot URL (optional)'
              state={state}
            >
              Screenshot URL (optional)
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

        {projects.map((project: any) => (
          <Project 
            key={project.projectID}
            deleteHandler={deleteProjectId(0, project.projectID, project.userId)}
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
    </div>
  );
} 