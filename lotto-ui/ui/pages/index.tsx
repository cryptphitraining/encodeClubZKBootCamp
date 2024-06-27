import { Link } from "@nextui-org/link";
import { button as buttonStyles } from "@nextui-org/theme";

import { siteConfig } from "@/config/site";
import { title } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import DefaultLayout from "@/layouts/default";



export default function IndexPage() {

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <h1 className={title()}>Experience the Future of Lotteries with&nbsp;</h1>
          <br />
          <h1 className={title({ color: "green" })}>Zero-Knowledge Proofs&nbsp;</h1>
          
   
        </div>

        <div className="flex gap-3">
          <Link
            isExternal
            className={buttonStyles({
              color: "success",
              radius: "full",
              variant: "shadow",
            })}
            href={siteConfig.navItems[1].href}
          >
            Play
          </Link>
          <Link
            isExternal
            className={buttonStyles({ variant: "bordered", radius: "full" })}
            href={siteConfig.links.github}
          >
            <GithubIcon size={20} />
            GitHub
          </Link>
        </div>

      </section>
    </DefaultLayout>
  );
}
