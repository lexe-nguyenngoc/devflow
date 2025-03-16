"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";
import { useState } from "react";

import { toast } from "@/hooks/use-toast";
import { cn, formatNumber } from "@/lib/utils";

interface Params {
  upvotes: number;
  downvotes: number;
  hasUpvoted: boolean;
  hasDownvoted: boolean;
}

const Votes = ({ upvotes, downvotes, hasUpvoted, hasDownvoted }: Params) => {
  const session = useSession();
  const userId = session.data?.user?.id;
  const [isLoading, setIsLoading] = useState(false);

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (!userId) {
      toast({
        title: "Please login to vote",
        description: "Only logged-in users can vote.",
      });

      return;
    }

    setIsLoading(true);

    try {
      const successMessage =
        voteType === "upvote"
          ? `Upvote ${!hasUpvoted ? "added" : "removed"}`
          : `Downvote ${!hasDownvoted ? "added" : "removed"}`;
      toast({
        title: successMessage,
        description: "Your vote has been recorded.",
      });
    } catch {
      toast({
        title: "Failed to vote",
        description: "An error occurred while voting. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-center gap-2.5">
      <div className="flex-center gap-1.5">
        <Image
          src={hasUpvoted ? "/icons/upvoted.svg" : "/icons/upvote.svg"}
          width={18}
          height={18}
          alt="upvote"
          className={cn("cursor-pointer", { "opacity-50": isLoading })}
          aria-label="Upvote"
          onClick={() => !isLoading && handleVote("upvote")}
        />

        <div className="flex-center background-light700_dark400 min-w-5 rounded-sm p-1">
          {formatNumber(upvotes)}
        </div>
      </div>

      <div className="flex-center gap-1.5">
        <Image
          src={hasUpvoted ? "/icons/downvoted.svg" : "/icons/downvote.svg"}
          width={18}
          height={18}
          alt="downvote"
          className={cn("cursor-pointer", { "opacity-50": isLoading })}
          aria-label="Downvote"
          onClick={() => !isLoading && handleVote("downvote")}
        />

        <div className="flex-center background-light700_dark400 min-w-5 rounded-sm p-1">
          {formatNumber(downvotes)}
        </div>
      </div>
    </div>
  );
};

export default Votes;
