"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";
import React, { useState } from "react";

import { toast } from "@/hooks/use-toast";
import { toggleSaveQuestion } from "@/lib/actions/collection.action";
import { cn } from "@/lib/utils";

const SaveQuestion = ({ questionId }: { questionId: string }) => {
  const session = useSession();
  const userId = session?.data?.user?.id;
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (isLoading) return;

    if (!userId)
      return toast({
        title: "You need to be logged in to save a question",
        variant: "destructive",
      });

    setIsLoading(true);

    try {
      const { success, data, error } = await toggleSaveQuestion({ questionId });

      if (!success) {
        throw new Error(error?.message || "An error occurred");
      }

      toast({
        title: `Question ${data?.saved ? "saved" : "unsaved"} successfully`,
        variant: data?.saved ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasSaved = true;

  return (
    <Image
      src={hasSaved ? "/icons/star-filled.svg" : "/icons/star-red.svg"}
      width={18}
      height={18}
      alt="save"
      className={cn("cursor-pointer", { "opacity-50": isLoading })}
      aria-label="Save Question"
      onClick={handleSave}
    />
  );
};

export default SaveQuestion;
