"use client";

import { usePathname } from "next/navigation";
import React from "react";

import { sidebarLinks } from "@/constants";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { SheetClose } from "@/components/ui/sheet";

interface NavLinkProps {
  isMobileNav?: boolean;
}

const NavLinks = ({ isMobileNav = false }: NavLinkProps) => {
  const pathname = usePathname();
  const userId = 1;

  return (
    <>
      {sidebarLinks.map((item) => {
        const isActive =
          (pathname.includes(item.route) && item.route.length > 1) ||
          pathname === item.route;

        if (item.route === "/profile") {
          if (!userId) return null;

          item.route = `${item.route}/${userId}`;
        }

        const LinkComponent = (
          <Link
            href={item.route}
            className={cn(
              isActive
                ? "primary-gradient rounded-lg text-light-900"
                : "text-dark300_light900",
              "flex items-center justify-start gap-4 bg-transparent p-4"
            )}
          >
            <Image
              src={item.imgURL}
              alt={item.label}
              width={20}
              height={20}
              className={cn({ "invert-colors": !isActive })}
            />
            <p
              className={cn(
                isActive ? "base-bold" : "base-medium",
                !isMobileNav && "max-lg:hidden"
              )}
            >
              {item.label}
            </p>
          </Link>
        );

        if (isMobileNav)
          return (
            <SheetClose asChild key={item.label}>
              {LinkComponent}
            </SheetClose>
          );

        return (
          <React.Fragment key={item.label}>{LinkComponent}</React.Fragment>
        );
      })}
    </>
  );
};

export default NavLinks;
