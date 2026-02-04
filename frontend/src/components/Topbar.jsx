// src/components/Topbar.jsx
import { FiPlus } from "react-icons/fi";

export default function Topbar({
  title = "Page",
  subtitle = "",
  primaryAction,   // { label, onClick, icon }
  secondaryAction // { label, onClick }
}) {
  return (
    <div className="px-6 pt-6">
      <div className="glass px-6 py-5 flex items-center justify-between gap-4">
        {/* Left: title */}
        <div>
          {subtitle ? (
            <div className="text-xs tracking-widest text-slate-400">
              {subtitle}
            </div>
          ) : null}
          <div className="text-2xl font-semibold">{title}</div>
        </div>

        {/* Right: actions (optional) */}
        {(primaryAction || secondaryAction) && (
          <div className="flex items-center gap-3">
            {secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                className="btn-ghost"
              >
                {secondaryAction.label}
              </button>
            )}

            {primaryAction && (
              <button
                onClick={primaryAction.onClick}
                className="btn inline-flex items-center gap-2"
              >
                {primaryAction.icon ?? <FiPlus />}
                {primaryAction.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
