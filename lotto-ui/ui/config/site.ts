export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "ZKP Lottery",
  description: "ZKP Lottery APP",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Admin",
      href: "/admin",
    }
  ],
  navMenuItems: [

    {
      label: "Dashboard",
      href: "/dashboard",
    }

  ],
  links: {
    github: "https://github.com/cryptphitraining/encodeClubZKBootCamp/"
  },
};
