import LoginOptions from "./options";

// Login Page (/bay/intro/login)
export default async function Page() {
  return (
    <>
      <div className="flex flex-col items-center justify-center h-[100vh] w-[100vw] bg-[url(/bay.webp)]">
        <img src="/logo.png" className="w-102 mb-4"></img>
        <LoginOptions></LoginOptions>
      </div>
    </>
  );
}
