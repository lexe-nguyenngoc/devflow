import Image from "next/image";
import Link from "next/link";
import React from "react";

import { cn } from "@/lib/utils";

interface Props {
  imgUrl: string;
  alt: string;
  value: string | number;
  title?: string;
  href?: string;
  textStyles: string;
  imgStyles?: string;
  isAuthor?: boolean;
  titleStyles?: string;
}
const Metric = ({
  imgUrl,
  alt,
  value,
  title,
  href,
  textStyles,
  imgStyles,
  isAuthor,
  titleStyles,
}: Props) => {
  const metricContent = (
    <>
      <Image
        src={imgUrl}
        alt={alt}
        width={16}
        height={16}
        className={`rounded-full object-contain ${imgStyles}`}
      />

      <p className={`${textStyles} flex items-center gap-1`}>
        {value}

        {title && (
          <span className={cn("small-regular line-clamp-1", titleStyles)}>
            {title}
          </span>
        )}
      </p>
    </>
  );

  if (href)
    return (
      <Link href={href} className="flex-center gap-1">
        {metricContent}
      </Link>
    );
  return <div className="flex-center gap-1">{metricContent}</div>;
};

export default Metric;
