import { fetchHackatimeProjects } from "@/lib/hackatime";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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
        const session = await auth();
        if (!session?.user) {
            return new Response("Unauthorized", { status: 401 });
        }

        const projects = await prisma.project.findMany({
            where: {
                userId: (session.user as any).id
            }
        });
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
}: Omit<Project, 'projectID' | 'submitted'>) => {
    return prisma.project.create({
        data: {
            projectID: crypto.randomUUID(),
            name,
            description,
            codeUrl,
            playableUrl,
            screenshot,
            hackatime,
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
    try {
        const session = await auth();
        if (!session?.user) {
            return new Response("Unauthorized", { status: 401 });
        }

        const { name, description, hackatime, codeUrl, playableUrl, screenshot } = await request.json();
        const createdProject = await createProject({ 
            name, 
            description, 
            hackatime, 
            codeUrl, 
            playableUrl, 
            screenshot,
            userId: (session.user as any).id
        });
        return Response.json({ success: true, data: createdProject });
    } catch (err) {
        return Response.json({ success: false, err });
    }
}