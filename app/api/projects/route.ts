import { fetchHackatimeProjects } from "@/lib/hackatime";
import Airtable from "airtable";

Airtable.configure({ 
   apiKey: process.env.AIRTABLE_PAT
})

const airtable = new Airtable();
const base = airtable.base(process.env.AIRTABLE_BASE ?? "");
const projectsBase = base("Projects");

export type Project = {
    id: string
    name: string,
    description: string
    codeUrl: string,
    playableUrl?: string
    hackatimeProject?: string
}

const getProjectsByUser = () => new Promise<Project[]>((resolve, reject) => {
    const projects: Project[] = [];
    projectsBase.select({ view: "Grid view" }).eachPage((records, fetchNextPage) => {
        records.forEach(record => {
            projects.push({
                id: record.id,
                name: record.get("Name") as string,
                description: record.get("Description") as string,
                codeUrl: record.get("Code URL") as string,
                playableUrl: record.get("Playable URL") as string
            } as Project);
        })
        fetchNextPage();
    }, (err) => {
        if (err) return reject();
        return resolve(projects);
    });
});

export async function GET(request: Request) { 
    const { searchParams } = new URL(request.url);
    // const josiasSlackID = "U01PJ08PR7S";
    // const hackatimeProjects = await fetchHackatimeProjects(josiasSlackID);
    if (searchParams.has("hackatime")) 
        return Response.json(await fetchHackatimeProjects(searchParams.get("slackID") as string))

    const projects = await getProjectsByUser();

    return Response.json(projects);
}

export const createProjectAirtable = async ({ codeUrl, playableUrl, description, name, hackatime }: any) => new Promise((resolve, reject) => {
    const payload = {
        "Code URL": codeUrl,
        "Playable URL": playableUrl,
        "Name": name,
        "Description": description,
        "Hackatime Project": hackatime
    };
    projectsBase.create([{
        "fields": payload
    }], (err: any, _: any) => {
        if (err) return reject(err);
        return resolve(payload);
    });
});

export async function POST(request: Request) {
    const { name, description, hackatime, codeUrl, playableUrl } = await request.json();
    try {
        const createdProject = await createProjectAirtable({ name, description, hackatime, codeUrl, playableUrl});
        return Response.json({ success: true, data: createdProject });
    } catch (err) {
        return Response.json({ success: false, err });
    }
}