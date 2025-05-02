import { Session } from "next-auth"

export type HeaderProps = {
    session: Session | null;
    status: "authenticated"|"unauthenticated"|"loading";
}

export default function Header({ session, status }: HeaderProps) {
    return (
        <nav className="w-full px-6 py-4 bg-[#47D1F6] flex items-center justify-between shadow-md rounded-b-2xl">
            <span className="text-lg font-bold text-white">Shipwrecked</span>
            <div className="flex items-center gap-4">
                {status === "authenticated" && (
                    <>
                        {session?.user?.image && (
                            <img
                                src={session.user.image}
                                alt={session.user.name ?? "User"}
                                className="w-10 h-10 rounded-full border-2 border-white shadow"
                            />
                        )}
                        <span className="text-white font-semibold">{session?.user?.name}</span>
                        <form action="/api/auth/signout" method="post">
                            <button
                                type="submit"
                                className="bg-white text-[#47D1F6] font-bold px-4 py-2 rounded-lg shadow hover:bg-[#f9e9c7] hover:text-[#3B2715] transition"
                            >
                                Log out
                            </button>
                        </form>
                    </>
                )}
                {status !== "authenticated" && (
                    <a
                        href="/api/auth/signin"
                        className="bg-white text-[#47D1F6] font-bold px-4 py-2 rounded-lg shadow hover:bg-[#f9e9c7] hover:text-[#3B2715] transition"
                    >
                        Sign in
                    </a>
                )}
            </div>
        </nav>
    )
}