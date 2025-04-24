"use client"
import { SessionProvider } from "next-auth/react";

export default function BayLayout({ children }: any) {
    return <>
        <SessionProvider>
            {children}
        </SessionProvider>
    </>
}