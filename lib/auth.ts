import { getServerSession } from "next-auth";
import { opts as authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function auth() {
    return await getServerSession(authOptions);
}