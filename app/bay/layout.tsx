'use client';
import { SessionProvider } from "next-auth/react";
import AuthCheck from "./auth-check";

export default function BayLayout({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
                {children}
        </SessionProvider>
    );
}