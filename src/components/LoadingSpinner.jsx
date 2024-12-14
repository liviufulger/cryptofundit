export default function LoadingSpinner({ size = "md" }) {
    const sizeClasses = {
      sm: "loading-sm",
      md: "loading-md",
      lg: "loading-lg"
    };
  
    return (
      <div className="flex justify-center items-center">
        <span className={`loading loading-spinner ${sizeClasses[size]}`}></span>
      </div>
    );
  }