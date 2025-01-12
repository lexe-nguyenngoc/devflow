import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { TECH_MAP } from "@/constants/techMap";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getDeviconClassName = (techName: string) => {
  const normalizedTechName = techName.replace(/[ .]/g, "").toLowerCase();

  const iconClass = TECH_MAP[normalizedTechName];

  return iconClass ? `${iconClass} colored` : "devicon-devicon-plain";
};
