"use client";

import Image from "next/image";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

import { formUrlQuery, removeKeyFromUrlQuery } from "@/lib/url";

import { Input } from "../ui/input";

interface Props {
  imgSrc: string;
  route?: string;
  placeholder: string;
  otherClasses?: string;
  iconPosition?: "left" | "right";
}

const LocalSearch = ({
  imgSrc,
  route,
  placeholder,
  otherClasses,
  iconPosition = "left",
}: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  const [searchQuery, setSearchQuery] = useState(query);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        const newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: "query",
          value: searchQuery,
        });

        router.push(newUrl, { scroll: false });
        return;
      }

      if (pathname === route) {
        const newUrl = removeKeyFromUrlQuery({
          params: searchParams.toString(),
          keysToRemove: ["query"],
        });
        router.push(newUrl, { scroll: false });
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, router, route, searchParams, pathname]);

  return (
    <div
      className={`background-light800_darkgradient flex min-h-[59px] grow items-center gap-4 rounded-[10px] px-4 ${otherClasses}`}
    >
      {iconPosition === "left" && (
        <label htmlFor="search">
          <Image
            src={imgSrc}
            width={24}
            height={24}
            alt="Search"
            className="cursor-pointer"
          />
        </label>
      )}
      <Input
        id="search"
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="paragraph-regular no-focus placeholder text-dark400_light700 border-none shadow-none outline-hidden"
      />
      {iconPosition === "right" && (
        <label htmlFor="search">
          <Image
            src={imgSrc}
            width={15}
            height={15}
            alt="Search"
            className="cursor-pointer"
          />
        </label>
      )}
    </div>
  );
};

export default LocalSearch;
