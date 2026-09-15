export default function Card({ children, className = "", style, ...rest }) {
  return (
    <div
      className={`relative rounded-[1.75rem] shadow-soft border p-4 transition-all duration-200 hover:shadow-[0_26px_45px_-30px_rgba(112,72,128,0.45)] ${className}`}
      style={{ backgroundColor: "var(--card-bg, #FFFFFF)", borderColor: "var(--card-border, #E4E4DA)", ...style }}
      {...rest}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[1.75rem]"
        style={{
          background:
            "linear-gradient(to right, transparent, color-mix(in srgb, var(--accent, #D77F6C) 45%, transparent), transparent)",
        }}
      />
      {children}
    </div>
  );
}
