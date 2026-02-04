// src/pages/Segments.jsx
import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Topbar from "../components/Topbar.jsx";
import { FiLayers, FiUsers, FiRefreshCw, FiTrendingUp } from "react-icons/fi";

// ✅ adjust this path if your api file name differs
import { donorsApi } from "../api/donor.js";

const SEGMENTS = [
  { key: "individual", title: "Individual", desc: "Personal donors (single person)." },
  { key: "corporate", title: "Corporate", desc: "Company / business donors." },
  { key: "foundation", title: "Foundation", desc: "NGO / foundation donors." },
];

// small helpers
const clamp01 = (n) => Math.max(0, Math.min(1, n));

function SegmentPill({ seg }) {
  const map = {
    individual: "bg-emerald-500/15 text-emerald-200 border-emerald-500/20",
    corporate: "bg-sky-500/15 text-sky-200 border-sky-500/20",
    foundation: "bg-violet-500/15 text-violet-200 border-violet-500/20",
  };
  const cls =
    map[seg] ?? "bg-white/5 text-slate-200 border-white/10";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs ${cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {seg}
    </span>
  );
}

function MiniBar({ value, max }) {
  const pct = max > 0 ? clamp01(value / max) : 0;
  return (
    <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden border border-white/10">
      <div
        className="h-full bg-white/20"
        style={{ width: `${Math.round(pct * 100)}%` }}
      />
    </div>
  );
}

function Donut({ counts, total }) {
  // simple CSS conic gradient donut
  const entries = Object.entries(counts || {});
  if (!total || total <= 0 || entries.length === 0) {
    return (
      <div className="h-28 w-28 rounded-full border border-white/10 bg-white/5 grid place-items-center text-xs text-slate-400">
        No data
      </div>
    );
  }

  const colors = {
    individual: "rgba(16,185,129,0.65)", // emerald
    corporate: "rgba(56,189,248,0.65)",  // sky
    foundation: "rgba(139,92,246,0.65)", // violet
  };

  let acc = 0;
  const stops = entries.map(([k, v]) => {
    const start = acc;
    const end = acc + (v / total) * 360;
    acc = end;
    const c = colors[k] || "rgba(255,255,255,0.35)";
    return `${c} ${start}deg ${end}deg`;
  });

  return (
    <div
      className="relative h-28 w-28 rounded-full"
      style={{ background: `conic-gradient(${stops.join(",")})` }}
      aria-label="Segment distribution"
      title="Segment distribution"
    >
      <div className="absolute inset-3 rounded-full bg-slate-950 border border-white/10" />
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-xs text-slate-400">Total</div>
          <div className="text-lg font-semibold">{total}</div>
        </div>
      </div>
    </div>
  );
}

export default function SegmentsPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [report, setReport] = useState(null);

  const load = async () => {
    try {
      setErr("");
      setLoading(true);
      // ✅ expects backend: GET /donors/report
      const json = await donorsApi.report();
      // unwrap your envelope: {status,message,data:{...}}
      const data = json?.data ?? json;
      setReport(data);
    } catch (e) {
      setErr(e?.message || "Failed to load segment report");
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totals = useMemo(() => {
    const bySegment = report?.bySegment || {};
    const total = Number(report?.total ?? 0);
    const max = Math.max(...Object.values(bySegment).map(Number), 0);
    return { bySegment, total, max };
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
        title="Segments"
        subtitle="DONOR SEGMENT INSIGHTS"
      />


        <div className="px-6 py-6 max-w-[1600px] mx-auto">
          {/* Header / Insights */}
          <section className="glass p-6 rounded-2xl">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <FiLayers className="text-indigo-400" />
                <div className="font-semibold">Segment Overview</div>
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
              {/* Donut */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 text-sm text-slate-200">
                  <FiUsers className="text-slate-300" />
                  Segment Distribution
                </div>

                <div className="mt-4 flex items-center gap-6">
                  <Donut counts={totals.bySegment} total={totals.total} />

                  <div className="flex-1 space-y-3">
                    {SEGMENTS.map((s) => {
                      const v = Number(totals.bySegment?.[s.key] ?? 0);
                      const pct = totals.total ? Math.round((v / totals.total) * 100) : 0;
                      return (
                        <div key={s.key} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <SegmentPill seg={s.key} />
                              <span className="text-xs text-slate-400">{s.title}</span>
                            </div>
                            <div className="text-xs text-slate-300">
                              <span className="font-semibold">{v}</span>{" "}
                              <span className="text-slate-500">({pct}%)</span>
                            </div>
                          </div>
                          <MiniBar value={v} max={totals.max} />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 text-xs text-slate-500">
                  Tip: these counts come from your report endpoint, not from the current page of donors.
                </div>
              </div>

              {/* Quick stats */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 text-sm text-slate-200">
                  <FiTrendingUp className="text-slate-300" />
                  Quick Stats
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs text-slate-500">Total donors</div>
                    <div className="text-2xl font-semibold mt-1">
                      {loading ? "…" : totals.total || 0}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs text-slate-500">Most used segment</div>
                    <div className="mt-2">
                      {(() => {
                        if (loading) return <span className="text-slate-400">…</span>;
                        const entries = Object.entries(totals.bySegment || {});
                        if (!entries.length) return <span className="text-slate-400">N/A</span>;
                        const [k, v] = entries.sort((a, b) => Number(b[1]) - Number(a[1]))[0];
                        return (
                          <div className="flex items-center justify-between">
                            <SegmentPill seg={k} />
                            <div className="text-sm font-semibold">{v}</div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs text-slate-500">Validation rules</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {SEGMENTS.map((s) => (
                        <span
                          key={s.key}
                          className="inline-flex rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-xs text-slate-300"
                        >
                          {s.key}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      Backend enforced: <span className="text-slate-300">individual | corporate | foundation</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Segment cards (your original list, but upgraded) */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-sm text-slate-200 font-semibold">Segment Types</div>
                <div className="mt-4 space-y-3">
                  {SEGMENTS.map((s) => {
                    const used = Number(totals.bySegment?.[s.key] ?? 0);
                    return (
                      <div
                        key={s.key}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-xs text-slate-500">Key</div>
                            <div className="mt-0.5 flex items-center gap-2">
                              <div className="font-semibold text-lg">{s.key}</div>
                              <SegmentPill seg={s.key} />
                            </div>
                            <div className="mt-2 text-sm text-slate-200">{s.title}</div>
                            <div className="mt-1 text-xs text-slate-500">{s.desc}</div>
                          </div>

                          <div className="text-right">
                            <div className="text-xs text-slate-500">Used</div>
                            <div className="mt-1 text-xl font-semibold">
                              {loading ? "…" : used}
                            </div>
                            <div className="mt-2">
                              <span className="inline-flex rounded-full bg-white/5 border border-white/10 px-2 py-1 text-xs text-slate-300">
                                donors.segment
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3">
                          <MiniBar value={used} max={totals.max} />
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
