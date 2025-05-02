"use client"
import { SessionProvider } from "next-auth/react";
import Header from "@/components/common/Header";
import { useSession } from "next-auth/react";

export default function BayLayout({ children }: any) {
    return <>
        <SessionProvider>
            <SessionWrapper>
                {children}
            </SessionWrapper>
        </SessionProvider>
    </>
}

function SessionWrapper({ children }: any) {
    const { data: session, status } = useSession();
    return (
        <>
            <Header 
                session={session}
                status={status}
            />
        {children}
        </>
    )
}