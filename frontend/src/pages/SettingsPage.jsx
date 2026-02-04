// src/pages/Settings.jsx (or SettingsPage.jsx)
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Topbar from "../components/Topbar.jsx";
import {
  FiSettings,
  FiLink,
  FiList,
  FiMoon,
  FiSun,
  FiCheckCircle,
  FiRotateCcw,
} from "react-icons/fi";

const DEFAULTS = {
  apiUrl: "http://localhost:8080",
  perPage: 20,
  theme: "dark",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [saved, setSaved] = useState(false);

  // load once
  useEffect(() => {
    try {
      const raw = localStorage.getItem("app_settings");
      if (raw) {
        const parsed = JSON.parse(raw);
        setSettings({ ...DEFAULTS, ...parsed });
      }
    } catch {
      setSettings(DEFAULTS);
    }
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;

    // keep perPage as number
    if (name === "perPage") {
      const n = Number(value);
      setSettings((prev) => ({ ...prev, [name]: Number.isFinite(n) ? n : 20 }));
      return;
    }

    setSettings((prev) => ({ ...prev, [name]: value }));
  }

  function saveSettings() {
    localStorage.setItem("app_settings", JSON.stringify(settings));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  }

  function resetSettings() {
    setSettings(DEFAULTS);
    localStorage.setItem("app_settings", JSON.stringify(DEFAULTS));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  }

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
            title="Settings"
            subtitle="APP PREFERENCES"
            />

        <div className="px-6 py-6 max-w-[1200px] mx-auto">
          <section className="glass p-6 rounded-2xl">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <FiSettings className="text-indigo-400" />
                <div className="font-semibold">Application Settings</div>
                <span className="text-xs text-slate-500">
                  Saved in <span className="text-slate-300">localStorage</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={resetSettings}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition"
                  title="Reset to defaults"
                >
                  <FiRotateCcw />
                  Reset
                </button>

                <button
                  onClick={saveSettings}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-medium hover:bg-indigo-500 transition"
                  title="Save settings"
                >
                  <FiCheckCircle />
                  Save
                </button>
              </div>
            </div>

            {/* Saved toast */}
            <div
              className={`mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-100 transition ${
                saved ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              Settings saved ✅
            </div>

            <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* LEFT: main form */}
              <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* API URL */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-200">
                      <FiLink className="text-slate-300" />
                      API Base URL
                    </div>
                    <input
                      type="text"
                      name="apiUrl"
                      value={settings.apiUrl}
                      onChange={handleChange}
                      placeholder="http://localhost:8080"
                      className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="text-xs text-slate-500">
                      Used for all fetch requests (ex: <span className="text-slate-300">/donors</span>,{" "}
                      <span className="text-slate-300">/donors/report</span>)
                    </div>
                  </div>

                  {/* Per page */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-200">
                      <FiList className="text-slate-300" />
                      Donors per page
                    </div>
                    <input
                      type="number"
                      name="perPage"
                      min={5}
                      max={100}
                      value={settings.perPage}
                      onChange={handleChange}
                      className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="text-xs text-slate-500">
                      Backend caps per_page at 100. Recommended: 10–30.
                    </div>
                  </div>

                  {/* Theme */}
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center gap-2 text-sm text-slate-200">
                      {settings.theme === "dark" ? (
                        <FiMoon className="text-slate-300" />
                      ) : (
                        <FiSun className="text-slate-300" />
                      )}
                      Theme
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSettings((p) => ({ ...p, theme: "dark" }))}
                        className={`rounded-2xl border p-4 text-left transition ${
                          settings.theme === "dark"
                            ? "border-indigo-500/40 bg-indigo-500/10"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <div className="font-semibold">Dark</div>
                        <div className="text-xs text-slate-500 mt-1">
                          Recommended for this UI.
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSettings((p) => ({ ...p, theme: "light" }))}
                        className={`rounded-2xl border p-4 text-left transition ${
                          settings.theme === "light"
                            ? "border-indigo-500/40 bg-indigo-500/10"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <div className="font-semibold">Light</div>
                        <div className="text-xs text-slate-500 mt-1">
                          Optional (your app is mostly dark).
                        </div>
                      </button>
                    </div>

                    <div className="text-xs text-slate-500">
                      Note: if you want theme to actually change styles globally, we’ll wire this setting into
                      the app root later.
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: preview / summary card */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-sm text-slate-200 font-semibold">Current Values</div>

                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs text-slate-500">API URL</div>
                    <div className="mt-1 text-sm break-all text-slate-200">{settings.apiUrl}</div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs text-slate-500">Per Page</div>
                    <div className="mt-1 text-sm text-slate-200">{settings.perPage}</div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs text-slate-500">Theme</div>
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                        {settings.theme === "dark" ? <FiMoon /> : <FiSun />}
                        {settings.theme}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500">
                    Saving writes to <span className="text-slate-300">localStorage.app_settings</span>.
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
