import { PrismaClient } from "@/app/generated/prisma/client";

export const prisma = new PrismaClient().$extends({
    name: "slackUserExtension",
    model: {
        user: {
            async slack(email: string) {
                return (await prisma.account.findFirst({
                    where: {
                        provider: 'slack',
                        user: { email }
                    },
                    select: {
                        providerAccountId: true
                    }
                }))?.providerAccountId
            }
        }
    }
});
