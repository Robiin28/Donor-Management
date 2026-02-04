// src/pages/Categories.jsx
import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Topbar from "../components/Topbar.jsx";
import {
  FiTag,
  FiRefreshCw,
  FiTrendingUp,
  FiPieChart,
  FiAward,
} from "react-icons/fi";

// ✅ adjust path if different
import { donorsApi } from "../api/donor.js";

const CATEGORIES = [
  { key: "recurring", title: "Recurring", desc: "Donates consistently over time." },
  { key: "VIP", title: "VIP", desc: "High value / special donors." },
  { key: "major", title: "Major", desc: "Large one-time or major donors." },
];

const clamp01 = (n) => Math.max(0, Math.min(1, n));

function CategoryPill({ cat }) {
  const map = {
    recurring: "bg-amber-500/15 text-amber-200 border-amber-500/20",
    VIP: "bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-500/20",
    major: "bg-cyan-500/15 text-cyan-200 border-cyan-500/20",
  };
  const cls = map[cat] ?? "bg-white/5 text-slate-200 border-white/10";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs ${cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {cat}
    </span>
  );
}

function MiniBar({ value, max }) {
  const pct = max > 0 ? clamp01(value / max) : 0;
  return (
    <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden border border-white/10">
      <div className="h-full bg-white/20" style={{ width: `${Math.round(pct * 100)}%` }} />
    </div>
  );
}

// A “slice” list with dot + percentage (different feel than Segments page)
function SliceRow({ label, value, total }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-white/30" />
        <div className="text-sm text-slate-200">{label}</div>
      </div>
      <div className="text-xs text-slate-300">
        <span className="font-semibold">{value}</span>{" "}
        <span className="text-slate-500">({pct}%)</span>
      </div>
    </div>
  );
}

function RadialStack({ counts, total }) {
  // different visual: stacked “rings” to hint proportions
  const order = ["recurring", "VIP", "major"];
  const colors = {
    recurring: "rgba(245,158,11,0.55)", // amber
    VIP: "rgba(217,70,239,0.55)",       // fuchsia
    major: "rgba(34,211,238,0.55)",     // cyan
  };

  if (!total || total <= 0) {
    return (
      <div className="h-28 w-28 rounded-2xl border border-white/10 bg-white/5 grid place-items-center text-xs text-slate-400">
        No data
      </div>
    );
  }

  const stops = [];
  let acc = 0;
  for (const k of order) {
    const v = Number(counts?.[k] ?? 0);
    const start = acc;
    const end = acc + (v / total) * 360;
    acc = end;
    stops.push(`${colors[k] || "rgba(255,255,255,0.25)"} ${start}deg ${end}deg`);
  }

  return (
    <div className="relative h-28 w-28 rounded-2xl border border-white/10 bg-white/5 grid place-items-center">
      <div className="h-20 w-20 rounded-full" style={{ background: `conic-gradient(${stops.join(",")})` }} />
      <div className="absolute bottom-3 text-center">
        <div className="text-[10px] text-slate-400">Total</div>
        <div className="text-sm font-semibold">{total}</div>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [report, setReport] = useState(null);

  const load = async () => {
    try {
      setErr("");
      setLoading(true);
      const json = await donorsApi.report(); // GET /donors/report
      const data = json?.data ?? json;
      setReport(data);
    } catch (e) {
      setErr(e?.message || "Failed to load category report");
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const byCategory = report?.byCategory || {};
    const total = Number(report?.total ?? 0);
    const max = Math.max(...Object.values(byCategory).map(Number), 0);

    const entries = Object.entries(byCategory || []).map(([k, v]) => [k, Number(v)]);
    entries.sort((a, b) => b[1] - a[1]);
    const top = entries[0]?.[0] ?? null;

    return { byCategory, total, max, top };
  }, [report]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* background glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-24 left-1/3 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute top-24 right-24 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <Sidebar />

      <main className="relative flex-1">
                <Topbar
            title="Categories"
            subtitle="DONOR CATEGORY INSIGHTS"
            />


        <div className="px-6 py-6 max-w-[1600px] mx-auto">
          <section className="glass p-6 rounded-2xl">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <FiTag className="text-indigo-400" />
                <div className="font-semibold">Category Overview</div>
                <span className="text-xs text-slate-500">
                  (from <span className="text-slate-300">/donors/report</span>)
                </span>
              </div>

              <button
                onClick={load}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition disabled:opacity-60"
                disabled={loading}
                title="Refresh"
              >
                <FiRefreshCw />
                Refresh
              </button>
            </div>

            {err ? (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
                {err}
              </div>
            ) : null}

            <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* LEFT: compact “radial + slice list” (different from Segments) */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 text-sm text-slate-200">
                  <FiPieChart className="text-slate-300" />
                  Category Distribution
                </div>

                <div className="mt-4 flex items-center gap-6">
                  <RadialStack counts={stats.byCategory} total={stats.total} />
                  <div className="flex-1 space-y-3">
                    <SliceRow
                      label="Recurring"
                      value={Number(stats.byCategory?.recurring ?? 0)}
                      total={stats.total}
                    />
                    <SliceRow
                      label="VIP"
                      value={Number(stats.byCategory?.VIP ?? 0)}
                      total={stats.total}
                    />
                    <SliceRow
                      label="Major"
                      value={Number(stats.byCategory?.major ?? 0)}
                      total={stats.total}
                    />
                    <div className="pt-2 text-xs text-slate-500">
                      Total donors are shared with segments report.
                    </div>
                  </div>
                </div>
              </div>

              {/* MIDDLE: quick stats */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 text-sm text-slate-200">
                  <FiTrendingUp className="text-slate-300" />
                  Quick Stats
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs text-slate-500">Total donors</div>
                    <div className="text-2xl font-semibold mt-1">
                      {loading ? "…" : stats.total || 0}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs text-slate-500">Top category</div>
                    <div className="mt-2">
                      {loading ? (
                        <span className="text-slate-400">…</span>
                      ) : stats.top ? (
                        <div className="flex items-center justify-between">
                          <CategoryPill cat={stats.top} />
                          <FiAward className="text-slate-300" />
                        </div>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </div>
                  </div>

                  <div className="col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs text-slate-500">Validation rules</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {CATEGORIES.map((c) => (
                        <span
                          key={c.key}
                          className="inline-flex rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-xs text-slate-300"
                        >
                          {c.key}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      Backend enforced:{" "}
                      <span className="text-slate-300">recurring | VIP | major</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: your original cards, upgraded with “Used” + progress bar */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-sm text-slate-200 font-semibold">Category Types</div>

                <div className="mt-4 space-y-3">
                  {CATEGORIES.map((c) => {
                    const used = Number(stats.byCategory?.[c.key] ?? 0);
                    return (
                      <div
                        key={c.key}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-xs text-slate-500">Key</div>
                            <div className="mt-0.5 flex items-center gap-2">
                              <div className="font-semibold text-lg">{c.key}</div>
                              <CategoryPill cat={c.key} />
                            </div>

                            <div className="mt-2 text-sm text-slate-200">{c.title}</div>
                            <div className="mt-1 text-xs text-slate-500">{c.desc}</div>

                            <div className="mt-3">
                              <span className="inline-flex rounded-full bg-white/5 border border-white/10 px-2 py-1 text-xs text-slate-300">
                                Used in donors.category
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-xs text-slate-500">Used</div>
                            <div className="mt-1 text-xl font-semibold">
                              {loading ? "…" : used}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3">
                          <MiniBar value={used} max={stats.max} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 text-xs text-slate-500">
                  Note: counts come from <span className="text-slate-300">/donors/report</span>.
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
