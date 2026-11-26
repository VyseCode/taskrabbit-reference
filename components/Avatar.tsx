type AvatarProps = {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const palette = [
  "bg-[#177245]",
  "bg-[#3b6ea5]",
  "bg-[#9a5b2d]",
  "bg-[#6b4f9e]",
  "bg-[#a3455b]",
];

export function Avatar({ name, size = "md", className = "" }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const color =
    palette[
      Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0) %
        palette.length
    ];
  const dimensions =
    size === "sm" ? "h-8 w-8 text-xs" : size === "lg" ? "h-16 w-16 text-xl" : "h-10 w-10 text-sm";

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${color} ${dimensions} ${className}`}
    >
      {initials || "?"}
    </span>
  );
}
