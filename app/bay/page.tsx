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
import ProgressBar from '@/components/common/ProgressBar';

export default function Bay() {
  const { data: session, status } = useSession();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('info');
  const [isOpenProjectModal, setIsOpenProjectModal] = useState<boolean>(false);
  const [totalHours, setTotalHours] = useState<number>(0);

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
        setIsOpenProjectModal(false); // close project modal
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
        r.forEach(project => formattedProjects[project.name] = project);
        setHackatimeProjects(formattedProjects);
      });
  }, [isOpenProjectModal]);

  async function getUserProjects() {
    const response = await fetch("/api/projects");
    const data = await response.json();

   
    setProjects(data);
  }

  useEffect(() => {
    // set total hours spent on projects
    const tHours = projects.map((p: any) => hackatimeProjects[p.hackatime]["hours" as any]).reduce((acc, curr) => acc + parseInt(curr), 0);
    setTotalHours(tHours);
  }, [hackatimeProjects, projects]);

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
            <span className={styles.statLabel}>Total Ships — </span>
            <span className={styles.statValue}>{projects.length}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Ships at Sea — </span>
            <span className={styles.statValue}>0</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Ships in Port — </span>
            <span className={styles.statValue}>0</span>
          </div>
        </div>

        <div className="w-60">
          <span className="flex flex-row items-center gap-2 text-2xl">
            🧑‍💻
            <ProgressBar value={totalHours} max={60} />
            🏝️
          </span>
          <h3>{totalHours}/60 - {60 - totalHours} more hours to go!</h3>
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
            // className={styles.submitLink}
            className="px-4 py-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 active:scale-95 transition font-semibold"
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
              values={Object.fromEntries(Object.keys(hackatimeProjects).map(item => [item, item]))}>
                Your Hackatime Project
              </FormSelect>
            <button
              type="submit"
              className="md:my-5 my-4 w-full px-3 sm:px-4 mt-4 focus:outline-2 py-2 bg-[#4BC679] rounded text-white self-center transition transform active:scale-95 hover:scale-105 hover:brightness-110"
              disabled={pending}
            >
              Create Project
            </button>
          </form>
        </Modal>

        <h1 className={`${styles.title} my-4`}>Your Projects</h1>
        <div className="grid grid-cols-3 gap-3 my-4">
          {projects.map((project: any) => (
            <Project
              key={project.projectID}
              deleteHandler={deleteProjectId(0, project.projectID, project.userId)}
              hours={hackatimeProjects[project.hackatime]["hours" as any]}
              {...project}
            />
          ))}
        </div>

        <Toaster richColors />
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