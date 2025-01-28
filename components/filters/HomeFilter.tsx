"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { formUrlQuery, removeKeyFromUrlQuery } from "@/lib/url";
import { cn } from "@/lib/utils";

import { Button } from "../ui/button";

const filters = [
  { name: "React", value: "react" },
  { name: "JavaScript", value: "javascript" },

  // { name: "Newest", value: "newest" },
  // { name: "Popular", value: "popular" },
  // { name: "Unanswered", value: "unanswered" },
  // { name: "Recommended", value: "recommended" },
];
const HomeFilter = () => {
  const searchParams = useSearchParams();
  const filterParams = searchParams.get("filter");
  const router = useRouter();

  const handleTypeClick = (filter: string) => {
    if (filter === filterParams) {
      router.push(
        removeKeyFromUrlQuery({
          params: searchParams.toString(),
          keysToRemove: ["filter"],
        }),
        { scroll: false },
      );
      return;
    }

    router.push(
      formUrlQuery({
        params: searchParams.toString(),
        key: "filter",
        value: filter.toLowerCase(),
      }),
      { scroll: false },
    );
  };

  return (
    <div className="mt-10 hidden flex-wrap gap-3 sm:flex">
      {filters.map((filter) => (
        <Button
          key={filter.name}
          onClick={() => handleTypeClick(filter.value)}
          className={cn(
            `body-medium rounded-lg px-6 py-3 capitalize shadow-none`,
            filterParams === filter.value
              ? "bg-primary-100 text-primary-500 hover:bg-primary-100 dark:bg-dark-400 dark:text-primary-500 dark:hover:bg-dark-400"
              : "bg-light-800 text-light-500 hover:bg-light-800 dark:bg-dark-300 dark:text-light-500 dark:hover:bg-dark-300",
          )}
        >
          {filter.name}
        </Button>
      ))}
    </div>
  );
};

export default HomeFilter;
