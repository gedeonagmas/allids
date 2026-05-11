
export type SubChildren = {
  href: string;
  label: string;
  active: boolean;
  children?: SubChildren[];
};
export type Submenu = {
  href: string;
  label: string;
  active: boolean;
  icon: any;
  submenus?: Submenu[];
  children?: SubChildren[];
};

export type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: any;
  submenus: Submenu[];
  id: string;
};

export type Group = {
  groupLabel: string;
  menus: Menu[];
  id: string;
};

export function getMenuList(pathname: string, t?: any): Group[] {
  return [
    {
      groupLabel: "Main Menu",
      id: "main",
      menus: [
        {
          id: "dashboard",
          href: "/dashboard/user",
          label: "Overview",
          active: pathname === "/dashboard/user",
          icon: "heroicons-outline:home",
          submenus: [],
        },
        {
          id: "wallet",
          href: "/dashboard/user/wallet",
          label: "Wallet",
          active: pathname.includes("/wallet"),
          icon: "heroicons-outline:credit-card",
          submenus: [],
        },
        {
          id: "verification",
          href: "/dashboard/user/verification",
          label: "Verification",
          active: pathname.includes("/verification"),
          icon: "heroicons-outline:shield-check",
          submenus: [],
        },
        {
          id: "access",
          href: "/dashboard/user/access",
          label: "Access Requests",
          active: pathname.includes("/access"),
          icon: "heroicons-outline:key",
          submenus: [],
        },
        {
          id: "notifications",
          href: "/dashboard/user/notifications",
          label: "Notifications",
          active: pathname.includes("/notifications"),
          icon: "heroicons-outline:bell",
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Account Settings",
      id: "settings_group",
      menus: [
        {
          id: "settings",
          href: "/dashboard/user/settings",
          label: "Settings",
          active: pathname.includes("/settings"),
          icon: "heroicons-outline:cog",
          submenus: [],
        },
      ],
    },
  ];
}

export function getHorizontalMenuList(pathname: string, t?: any): Group[] {
    return getMenuList(pathname, t);
}
