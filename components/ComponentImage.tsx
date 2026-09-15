"use client";

import { useState } from "react";
import { Category } from "@/lib/types";
import CategoryIcon, { categoryPlaceholderClass } from "./CategoryIcon";

export default function ComponentImage({
  category,
  imageUrl,
  alt,
  className = "",
  iconClassName = "w-10 h-10",
}: {
  category: Category;
  imageUrl: string | null;
  alt: string;
  className?: string;
  iconClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showPlaceholder = !imageUrl || failed;

  if (showPlaceholder) {
    return (
      <div
        className={`flex items-center justify-center ${categoryPlaceholderClass(
          category
        )} ${className}`}
      >
        <CategoryIcon category={category} className={iconClassName} />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt={alt}
      className={`object-contain ${className}`}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}
