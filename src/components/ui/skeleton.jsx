import { cn } from '../../lib/utils';

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-deep-green/10',
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
