import React from 'react';
import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'card' | 'text' | 'circular';
  lines?: number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'default',
  lines = 1
}) => {
  const baseClasses = "animate-pulse bg-gradient-to-r from-slate-700/50 via-slate-600/50 to-slate-700/50 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]";

  if (variant === 'card') {
    return (
      <div className={clsx(
        "rounded-2xl bg-white/5 p-6 border border-white/10",
        className
      )}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className={clsx(baseClasses, "h-6 w-24 rounded-lg")} />
            <div className={clsx(baseClasses, "h-6 w-16 rounded-full")} />
          </div>
          <div className={clsx(baseClasses, "h-8 w-full rounded-xl")} />
          <div className="flex gap-4">
            <div className={clsx(baseClasses, "h-4 w-20 rounded-lg")} />
            <div className={clsx(baseClasses, "h-4 w-24 rounded-lg")} />
          </div>
          <div className={clsx(baseClasses, "h-16 w-full rounded-xl")} />
          <div className="flex gap-3">
            <div className={clsx(baseClasses, "h-10 flex-1 rounded-xl")} />
            <div className={clsx(baseClasses, "h-10 flex-1 rounded-xl")} />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={clsx(
              baseClasses,
              "h-4 rounded",
              index === lines - 1 ? "w-3/4" : "w-full",
              className
            )}
          />
        ))}
      </div>
    );
  }

  if (variant === 'circular') {
    return (
      <div className={clsx(
        baseClasses,
        "rounded-full aspect-square",
        className
      )} />
    );
  }

  return (
    <div className={clsx(
      baseClasses,
      "h-32 rounded-xl",
      className
    )} />
  );
};

export default Skeleton;
