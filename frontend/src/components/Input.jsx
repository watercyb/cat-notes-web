const Input = ({ icon, isMismatch, ...props }) => {
  const Icon = icon;
  return (
    <div className="relative mb-5">
      <Icon
        className={`absolute left-3 top-1/2 -translate-y-1/2 z-10 size-5 transition-colors duration-200 ${
          isMismatch ? "text-rose-400" : "text-[#D4A48A]"
        }`}
      />

      <input
        {...props}
        className={`
        w-full
        rounded-2xl
        border
        px-4
        py-3
        pl-11
        bg-white/80
        backdrop-blur-sm
        border-[#E8D8CC]
        text-[#5B4A42]
        placeholder:text-[#B6A298]
        shadow-sm
        transition-all
        duration-200

        focus:border-[#F5A247]
        focus:ring-4
        focus:ring-orange-200/50
        focus:bg-white
        focus:outline-none
      `}
      />
    </div>
  );
};
export default Input;
