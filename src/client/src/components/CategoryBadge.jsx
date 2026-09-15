import { MoreHorizontal } from "lucide-react";
import { shadeCss, shadeTextColor } from "../lib/shades.js";

export default function CategoryBadge({ category, index = 0 }) {
  if (!category) return null;
  const Icon = category.icon || MoreHorizontal;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: shadeCss(index), color: shadeTextColor(index) }}
    >
      <Icon size={13} />
      {category.label}
    </span>
  );
}
