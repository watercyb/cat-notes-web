import { motion as Motion } from "framer-motion";

const LoadingSpinner = () => {
  return (
    <div
      className="
      min-h-screen
      bg-linear-to-br
      from-[#FFF7F2]
      via-[#FFF9F5]
      to-[#FCEFE5]
      flex
      items-center
      justify-center
      relative
      overflow-hidden
    "
    >
      <Motion.div
        className="
        w-16
        h-16
        rounded-full
        border-4
        border-[#F5D9C5]
        border-t-[#F08A3C]
      "
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
};

export default LoadingSpinner;
