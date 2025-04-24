import { fetchHackatimeProjects } from "@/lib/hackatime";
import { prisma } from "@/lib/prisma";

export type Project = {
    projectID: string
    name: string
    description: string
    codeUrl: string
    playableUrl: string
    screenshot: string
    hackatime?: string
    submitted: boolean
    userId: string
}

export async function GET(request: Request) { 
    const { searchParams } = new URL(request.url);
    
    if (searchParams.has("hackatime")) {
        return Response.json(await fetchHackatimeProjects(searchParams.get("slackID") as string));
    }

    try {
        const projects = await prisma.project.findMany();
        return Response.json(projects);
    } catch (err) {
        console.log("got error", err);
        return new Response(err as any);
    }
}

export const createProject = async ({ 
    name, 
    description, 
    codeUrl, 
    playableUrl, 
    screenshot, 
    hackatime, 
    userId 
}: Omit<Project, 'projectID' | 'submitted'> & { hackatime?: string }) => {
    return prisma.project.create({
        data: {
            projectID: crypto.randomUUID(),
            name,
            description,
            codeUrl,
            playableUrl,
            screenshot,
            hackatime: hackatime || "",
            userId,
            submitted: false
        }
    });
};

export const deleteProject = async (projectID: string, userId: string) => {
    return prisma.project.delete({
        where: {
            projectID_userId: {
                projectID,
                userId
            }
        }
    });
};

export async function POST(request: Request) {
    const { name, description, hackatime, codeUrl, playableUrl, screenshot, userId } = await request.json();
    
    try {
        const createdProject = await createProject({ 
            name, 
            description, 
            hackatime, 
            codeUrl, 
            playableUrl, 
            screenshot, 
            userId 
        });
        return Response.json({ success: true, data: createdProject });
    } catch (err) {
        return Response.json({ success: false, err });
    }
}