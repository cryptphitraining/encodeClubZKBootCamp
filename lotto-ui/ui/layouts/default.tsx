import { Link } from "@nextui-org/link";

import { Head } from "./head";

import { Navbar } from "@/components/navbar";

import GradientBG from "@/components/GradientBG";


export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GradientBG>
      <div className="relative flex flex-col h-screen">
        <Head />
        <Navbar />
        <main className="container mx-auto max-w-7xl px-6 flex-grow pt-16">
          {children}
        </main>
        <footer className="w-full flex items-center justify-center py-3">
          <Link
            isExternal
            className="flex items-center gap-1 text-current"
            href="https://minaprotocol.com/zkapps"
            title="minaprotocol.com homepage"
          >
            <span className="text-default-600">Powered by</span>
            <p className="text-primary">Mina</p>
          </Link>
        </footer>
      </div>
    </GradientBG>
  );
}
