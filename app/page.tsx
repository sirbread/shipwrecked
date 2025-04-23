"use client";
import { useState, useEffect } from "react";
import Story from "@/components/launch/Story";
import { ReactLenis } from "lenis/react";
import LoadingModal from "@/components/common/LoadingModal";
import Link from "next/link";

const loadingMessages = [
  "Swabbing the decks...",
  "Counting the doubloons...",
  "Polishing the cannonballs...",
  "Teaching the parrot to talk...",
  "Burying the treasure...",
  "Filling the rum barrels...",
  "Sharpening the cutlasses...",
  "Mending the sails...",
  "Cleaning the spyglass...",
  "Stocking the galley...",
  "Checking the compass...",
  "Raising the Jolly Roger...",
  "Loading the cannon...",
  "Untying the knots...",
  "Hoisting the anchor...",
  "Dusting off the treasure map...",
  "Filling the water barrels...",
  "Checking the rigging...",
  "Waxing the figurehead...",
  "Preparing the plank...",
];

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [scrollPercent, setScrollPercent] = useState(0);

  const handleLoadComplete = () => {
    setIsLoading(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      setScrollPercent(scrollTop / (scrollHeight - clientHeight));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const bannerOpacity = Math.max(0, Math.min(1, (0.75 - scrollPercent) / 0.1));

  const imageUrls = [
    // Essential UI elements
    "/logo.png",
    "/logo-outline.svg",
    "/calendar-icon.png",
    "/location-icon.png",
    "/sand-logo.png",
    "/bottle.png",
    "/back-arrow.png",
    // Background images
    "/shore.webp",
    // All wave images (preload to avoid jumpiness)
    ...Array.from({ length: 10 }, (_, i) => `/waves/${i + 1}.webp`),
  ];

  if (isLoading) {
    return (
      <LoadingModal
        titles={loadingMessages}
        imageUrls={imageUrls}
        onLoadComplete={handleLoadComplete}
      />
    );
  }

  return (
    <ReactLenis root>
      <div>
        <main className="h-[1000vh]">
          <Link href="https://hackclub.com">
            <img
              style={{
                position: "fixed",
                top: "20px",
                left: "0",
                border: "0",
                width: "180px",
                zIndex: "999",
                opacity: bannerOpacity,
                transition: "opacity 0.2s ease-out"
              }}
              src="https://assets.hackclub.com/banners/2025.svg"
              alt="Hack Club"
            />
          </Link>
          <Story />
        </main>
      </div>
    </ReactLenis>
  );
}
