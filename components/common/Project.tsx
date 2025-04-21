'use client'
import type { Project } from "@/app/api/projects/route"
import Icon from "@hackclub/icons"

export function Project({ name, description, codeUrl, playableUrl }: Project) {
    return (
        <div
            className="p-4 rounded-xl relative w-full max-w-md overflow-hidden border-0 bg-[#38b6e3] shadow-lg"
        >
            <div
                className="absolute bottom-0 left-0 right-0 h-16 bg-[#f9e9c7]"
                style={{
                    clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 85% 25%, 70% 0%, 55% 25%, 40% 0%, 25% 25%, 10% 0%, 0% 20%)",
                }}
            />
            <h2 className="flex flex-row items-center font-sans text-3xl font-extrabold uppercase tracking-wider text-white">
                <Icon glyph="explore" size={60} />
                {name}
            </h2>
            <p className="text-md font-medium text-white mx-6">
                {description}
            </p>
            <div className="relative w-full flex flex-wrap items-center gap-2">
                <a href={codeUrl} className="flex flex-row items-center gap-2 w-40 h-8 m-2 rounded-lg bg-[#ffd84d] px-3 py-2 text-md font-bold text-[#1a5e7a] transition-transform hover:scale-105">
                        <Icon glyph="code" size={30} />
                        View Code
                </a>
                <a href={playableUrl} className="flex flex-row items-center gap-2 w-40 h-8 rounded-lg bg-white px-3 py-2 text-md font-bold text-[#1a5e7a] transition-transform hover:scale-105">
                    <Icon glyph="link" size={30} />
                    Try It!
                </a>
            </div>
        </div>
    )
}