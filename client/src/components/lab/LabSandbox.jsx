import { forwardRef } from 'react';

const LabSandbox = forwardRef(function LabSandbox({ className, style, ...props }, ref) {
  return (
    <iframe
      ref={ref}
      sandbox="allow-scripts"
      title="Lab sandbox"
      style={{ display: 'none', ...style }}
      className={className}
      {...props}
    />
  );
});

export default LabSandbox;
