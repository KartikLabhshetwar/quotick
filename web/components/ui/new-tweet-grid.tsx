"use client";

import React from "react";
import { Tweet } from "react-tweet";

interface TweetGridProps {
  tweets: string[];
  speed?: "slow" | "normal" | "fast";
  className?: string;
}

export default function TweetGrid({ tweets, speed = "normal", className = "" }: TweetGridProps) {
  const getDuration = () => {
    switch (speed) {
      case "slow":
        return "30s";
      case "fast":
        return "10s";
      default:
        return "20s";
    }
  };

  return (
    <div className={`overflow-hidden ${className}`} data-theme="light">
      <div
        className="flex gap-4"
        style={{
          animation: `scroll ${getDuration()} linear infinite`,
        }}
      >
        {[...tweets, ...tweets].map((tweetId, index) => (
          <div
            key={`${tweetId}-${index}`}
            className="shrink-0 w-[350px]"
          >
            <div data-theme="light">
              <Tweet id={tweetId} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

