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

export type ProjectInput = Omit<Project, 'projectID' | 'submitted'>

export async function createProject(data: ProjectInput) {
    return prisma.project.create({
        data: {
            projectID: crypto.randomUUID(),
            name: data.name,
            description: data.description,
            codeUrl: data.codeUrl,
            playableUrl: data.playableUrl,
            screenshot: data.screenshot || "",
            hackatime: data.hackatime || "",
            userId: data.userId,
            submitted: false
        }
    });
}

export async function deleteProject(projectID: string, userId: string) {
    return prisma.project.delete({
        where: {
            projectID_userId: {
                projectID,
                userId
            }
        }
    });
} 