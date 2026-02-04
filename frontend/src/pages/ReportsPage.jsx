import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Topbar from "../components/Topbar.jsx";
import { donorsApi } from "../api/donor";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function formatDayLabel(isoDay) {
  const d = new Date(`${isoDay}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDay;
  return d.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);

  const [total, setTotal] = useState(0);
  const [bySegment, setBySegment] = useState({});
  const [byCategory, setByCategory] = useState({});
  const [rawSeries, setRawSeries] = useState([]); // [{day,daily,cumulative}]

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        // calls: GET http://localhost:8080/donors/report
        const res = await donorsApi.report();

        // ✅ Normalize (supports both: {data:{...}} and direct {...})
        const payload = res?.data ?? res ?? {};

        // ✅ debug (keep until confirmed)
        console.log("REPORT RAW:", res);
        console.log("REPORT PAYLOAD:", payload);

        setTotal(Number(payload.total ?? 0));
        setBySegment(payload.bySegment ?? {});
        setByCategory(payload.byCategory ?? {});
        setRawSeries(Array.isArray(payload.series) ? payload.series : []);
      } catch (e) {
        console.error("REPORT ERROR:", e);
        // optional: clear UI on error
        setTotal(0);
        setBySegment({});
        setByCategory({});
        setRawSeries([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const series = useMemo(() => {
    return (rawSeries || []).map((r) => ({
      ...r,
      // ensure label exists for x-axis
      label: formatDayLabel(r.day),
      // ensure numbers are numbers
      daily: Number(r.daily ?? 0),
      cumulative: Number(r.cumulative ?? 0),
    }));
  }, [rawSeries]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* background glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-24 left-1/3 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute top-24 right-24 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <Sidebar />

      <main className="relative flex-1">
        <Topbar title="Reports" subtitle="DONOR ANALYTICS" />

        <div className="px-6 py-6 max-w-[1600px] mx-auto space-y-6">
          {/* HERO CHART */}
          <section className="glass p-6 rounded-2xl">
            <div className="flex items-start justify-between gap-6 mb-4">
              <div>
                <div className="text-sm text-slate-400">Trend line</div>
                <div className="text-xl font-semibold">
                  Donor Growth (Cumulative)
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  X-axis = day • Y-axis = total donors up to that day
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-slate-400">Total donors</div>
                <div className="text-3xl font-semibold">{total}</div>
              </div>
            </div>

            {loading ? (
              <div className="text-slate-400">Loading chart…</div>
            ) : series.length < 2 ? (
              <div className="text-slate-400">
                Add donors on at least 2 different times (or days) to see a trend.
              </div>
            ) : (
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={series}
                    margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke="rgba(255,255,255,0.08)"
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "rgba(148,163,184,1)", fontSize: 12 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                      tickLine={{ stroke: "rgba(255,255,255,0.12)" }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "rgba(148,163,184,1)", fontSize: 12 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                      tickLine={{ stroke: "rgba(255,255,255,0.12)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(15,23,42,0.95)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: 12,
                        color: "white",
                      }}
                      labelStyle={{ color: "rgba(148,163,184,1)" }}
                      formatter={(value, name) => [
                        value,
                        name === "cumulative"
                          ? "Cumulative donors"
                          : "Daily donors",
                      ]}
                      labelFormatter={(label) => `Day: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="cumulative"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      dot={{ r: 3.5, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          {/* STATS + BREAKDOWNS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="glass p-6 rounded-2xl">
              <div className="text-sm text-slate-400">Segments</div>

              <div className="mt-4 space-y-3">
                {Object.entries(bySegment).map(([k, v]) => (
                  <div key={k}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">{k}</span>
                      <span className="text-slate-400">{v}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500"
                        style={{ width: `${total ? (Number(v) / total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}

                {!loading && Object.keys(bySegment).length === 0 && (
                  <div className="text-slate-400 text-sm">No data yet</div>
                )}
              </div>
            </section>

            <section className="glass p-6 rounded-2xl">
              <div className="text-sm text-slate-400">Categories</div>

              <div className="mt-4 space-y-3">
                {Object.entries(byCategory).map(([k, v]) => (
                  <div key={k}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">{k}</span>
                      <span className="text-slate-400">{v}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${total ? (Number(v) / total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}

                {!loading && Object.keys(byCategory).length === 0 && (
                  <div className="text-slate-400 text-sm">No data yet</div>
                )}
              </div>
            </section>

            <section className="glass p-6 rounded-2xl">
              <div className="text-sm text-slate-400">Daily activity</div>
              <div className="mt-2 text-xs text-slate-500">
                How many donors were added each day
              </div>

              <div className="mt-4 space-y-2">
                {series.slice(-7).map((row) => (
                  <div
                    key={row.day}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-slate-300">{row.label}</span>
                    <span className="text-slate-400">{row.daily}</span>
                  </div>
                ))}

                {!loading && series.length === 0 && (
                  <div className="text-slate-400 text-sm">No data yet</div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
