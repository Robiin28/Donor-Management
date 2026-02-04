import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiEdit2, FiPlusCircle, FiTrash2, FiXCircle } from "react-icons/fi";
import toast from "react-hot-toast";

import Sidebar from "../components/Sidebar.jsx";
import Topbar from "../components/Topbar.jsx";
import { donorsApi } from "../api/donor.js";

const initialForm = {
  full_name: "",
  phone: "",
  email: "",
  blood_group: "",
  address: "",
  segment: "individual",
  category: "recurring",
};

export default function DonorsPage() {
  const [form, setForm] = useState(initialForm);

  const [donors, setDonors] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    per_page: 10,
    total: 0,
    page_count: 1,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  const pageSizes = [5, 10, 20, 50];

  // -------------------------
  // Animations
  // -------------------------
  const pageAnim = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  };

  const cardAnim = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: "easeOut" } },
  };

  const listAnim = {
    hidden: {},
    show: { transition: { staggerChildren: 0.03 } },
  };

  const rowAnim = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.18, ease: "easeOut" } },
    exit: { opacity: 0, y: -6, transition: { duration: 0.12 } },
  };

  const toastIfError = (e, fallback) => {
    const msg = e?.message || fallback;
    setError(msg);
    toast.error(msg);
  };

  // ✅ IMPORTANT FIX FOR DEPLOY:
  // - Removed any hardcoded localhost fetch
  // - Only one initial load (your old code had TWO useEffects firing load twice)
  const load = useCallback(
    async (page = 1, perPage = meta.per_page) => {
      setLoading(true);
      setError("");
      try {
        // If your donorsApi supports listWithMeta, use it (pagination)
        if (typeof donorsApi.listWithMeta === "function") {
          const res = await donorsApi.listWithMeta({ page, per_page: perPage });

          setDonors(res.items || []);
          setMeta(
            res.meta || {
              page,
              per_page: perPage,
              total: (res.items || []).length,
              page_count: 1,
            }
          );
        } else {
          // Fallback for older api file (no pagination endpoint)
          const items = await donorsApi.list();
          setDonors(items || []);
          setMeta((m) => ({
            ...m,
            page: 1,
            page_count: 1,
            total: (items || []).length,
          }));
        }
      } catch (e) {
        toastIfError(e, "Failed to load donors");
      } finally {
        setLoading(false);
      }
    },
    // keep meta.per_page current
    [meta.per_page]
  );

  useEffect(() => {
    load(1, meta.per_page);
  }, [load, meta.per_page]);

  const onChange = (k) => (e) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const startEdit = (d) => {
    setEditingId(d.id);
    setForm({
      full_name: d.full_name || "",
      phone: d.phone || "",
      email: d.email || "",
      blood_group: d.blood_group || "",
      address: d.address || "",
      segment: d.segment || "individual",
      category: d.category || "recurring",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    setError("");

    try {
      if (editingId) {
        await donorsApi.update(editingId, form);
        toast.success("Donor updated ✅");
      } else {
        await donorsApi.create(form);
        toast.success("Donor created ✅");
      }

      resetForm();
      await load(meta.page, meta.per_page);
    } catch (e) {
      toastIfError(e, "Failed to save donor");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    const ok = window.confirm("Delete this donor? This cannot be undone.");
    if (!ok) return;

    setDeletingId(id);
    setError("");

    try {
      await donorsApi.remove(id);
      toast.success("Donor deleted 🗑️");

      // If last item on page deleted, go back a page if needed
      const nextTotal = Math.max(0, (meta.total || 0) - 1);
      const nextPageCount = Math.max(1, Math.ceil(nextTotal / meta.per_page));
      const nextPage = Math.min(meta.page, nextPageCount);

      await load(nextPage, meta.per_page);

      if (String(editingId) === String(id)) resetForm();
    } catch (e) {
      toastIfError(e, "Failed to delete donor");
    } finally {
      setDeletingId(null);
    }
  };

  // NOTE: With server pagination, search filters ONLY the current page (by design).
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return donors;

    return donors.filter((d) =>
      `${d.full_name || ""} ${d.phone || ""} ${d.email || ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [donors, search]);

  const safeSelectProps = {
    style: { colorScheme: "dark" },
  };

  return (
    <motion.div
      className="min-h-screen bg-slate-950 text-slate-100 flex"
      variants={pageAnim}
      initial="hidden"
      animate="show"
    >
      {/* background glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-24 left-1/3 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute top-24 right-24 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <Sidebar />

      <main className="relative flex-1">
        <Topbar title="Donors" subtitle="MANAGE DONOR PROFILES" />

        <div className="px-6 py-6 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LIST */}
          <motion.section
            className="glass p-6 rounded-2xl lg:col-span-2"
            variants={cardAnim}
            initial="hidden"
            animate="show"
          >
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
              <div>
                <div className="text-sm text-slate-400">Donor registry</div>
                <div className="text-xl font-semibold">Donors</div>
                <div className="text-xs text-slate-500 mt-1">
                  Page {meta.page} / {meta.page_count} • Total {meta.total}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  className="input w-64"
                  placeholder="Search name / phone / email…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                <select
                  className="select w-28"
                  value={meta.per_page}
                  onChange={(e) => {
                    const per = Number(e.target.value);
                    setMeta((m) => ({ ...m, per_page: per }));
                    load(1, per);
                  }}
                  disabled={loading}
                  {...safeSelectProps}
                >
                  {pageSizes.map((n) => (
                    <option key={n} value={n}>
                      {n}/page
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-slate-300">
                  <tr className="border-b border-white/10">
                    <th className="py-3 px-3 text-left font-medium">#</th>
                    <th className="py-3 px-3 text-left font-medium">Name</th>
                    <th className="py-3 px-3 text-left font-medium">Phone</th>
                    <th className="py-3 px-3 text-left font-medium">Segment</th>
                    <th className="py-3 px-3 text-left font-medium">Category</th>
                    <th className="py-3 px-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>

                <motion.tbody
                  className="text-slate-200"
                  variants={listAnim}
                  initial="hidden"
                  animate="show"
                >
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 px-3 text-slate-400">
                        Loading…
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 px-3 text-slate-400">
                        No donors found.
                      </td>
                    </tr>
                  ) : (
                    <AnimatePresence initial={false}>
                      {filtered.map((d, index) => {
                        const isEditing = String(editingId) === String(d.id);
                        const rowNo =
                          (meta.page - 1) * meta.per_page + index + 1;

                        return (
                          <motion.tr
                            key={d.id}
                            variants={rowAnim}
                            initial="hidden"
                            animate="show"
                            exit="exit"
                            className={`border-b border-white/5 hover:bg-white/5 ${
                              isEditing ? "bg-indigo-500/10" : ""
                            }`}
                          >
                            <td className="py-3 px-3">{rowNo}</td>

                            <td className="py-3 px-3">
                              <div className="font-medium">{d.full_name}</div>
                              <div className="text-xs text-slate-500">
                                {d.email || "-"}
                              </div>
                            </td>

                            <td className="py-3 px-3">{d.phone}</td>

                            <td className="py-3 px-3">
                              <span className="inline-flex rounded-full bg-white/5 px-2 py-1 text-xs">
                                {d.segment}
                              </span>
                            </td>

                            <td className="py-3 px-3">
                              <span className="inline-flex rounded-full bg-white/5 px-2 py-1 text-xs">
                                {d.category}
                              </span>
                            </td>

                            <td className="py-3 px-3">
                              <div className="flex justify-end gap-3">
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => startEdit(d)}
                                  className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 disabled:opacity-50"
                                  disabled={
                                    saving || loading || deletingId === d.id
                                  }
                                >
                                  <FiEdit2 /> Edit
                                </motion.button>

                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => remove(d.id)}
                                  disabled={
                                    deletingId === d.id || saving || loading
                                  }
                                  className="text-red-300 hover:text-red-200 inline-flex items-center gap-1 disabled:opacity-50"
                                >
                                  <FiTrash2 />{" "}
                                  {deletingId === d.id ? "Deleting…" : "Delete"}
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  )}
                </motion.tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Showing {filtered.length} on this page
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-ghost"
                  disabled={meta.page <= 1 || loading}
                  onClick={() => load(meta.page - 1, meta.per_page)}
                >
                  Prev
                </motion.button>

                <div className="text-sm text-slate-300 px-2">
                  {meta.page} / {meta.page_count}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-ghost"
                  disabled={meta.page >= meta.page_count || loading}
                  onClick={() => load(meta.page + 1, meta.per_page)}
                >
                  Next
                </motion.button>
              </div>
            </div>
          </motion.section>

          {/* FORM */}
          <motion.section
            className={`glass p-6 rounded-2xl border ${
              editingId ? "border-indigo-500/40" : "border-white/10"
            }`}
            variants={cardAnim}
            initial="hidden"
            animate="show"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {editingId ? (
                  <>
                    <FiEdit2 className="text-indigo-400" />
                    <div>
                      <div className="font-semibold">Edit Donor</div>
                      <div className="text-xs text-slate-500">
                        Updating donor ID: {editingId}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <FiPlusCircle className="text-emerald-400" />
                    <div>
                      <div className="font-semibold">Add Donor</div>
                      <div className="text-xs text-slate-500">
                        Register a new donor
                      </div>
                    </div>
                  </>
                )}
              </div>

              {editingId && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-ghost inline-flex items-center gap-1"
                  onClick={resetForm}
                  disabled={saving}
                >
                  <FiXCircle /> Cancel
                </motion.button>
              )}
            </div>

            <motion.form
              onSubmit={submit}
              className="space-y-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <input
                className="input"
                placeholder="Full name *"
                value={form.full_name}
                onChange={onChange("full_name")}
                required
              />
              <input
                className="input"
                placeholder="Phone *"
                value={form.phone}
                onChange={onChange("phone")}
                required
              />
              <input
                className="input"
                placeholder="Email"
                value={form.email}
                onChange={onChange("email")}
              />
              <input
                className="input"
                placeholder="Blood group"
                value={form.blood_group}
                onChange={onChange("blood_group")}
              />
              <input
                className="input"
                placeholder="Address"
                value={form.address}
                onChange={onChange("address")}
              />

              <select
                className="select"
                value={form.segment}
                onChange={onChange("segment")}
                {...safeSelectProps}
              >
                <option value="individual">individual</option>
                <option value="corporate">corporate</option>
                <option value="foundation">foundation</option>
              </select>

              <select
                className="select"
                value={form.category}
                onChange={onChange("category")}
                {...safeSelectProps}
              >
                <option value="recurring">recurring</option>
                <option value="VIP">VIP</option>
                <option value="major">major</option>
              </select>

              <motion.button
                type="submit"
                className="btn w-full"
                disabled={saving}
                whileHover={{ scale: saving ? 1 : 1.02 }}
                whileTap={{ scale: saving ? 1 : 0.98 }}
              >
                {saving ? "Saving…" : editingId ? "Update Donor" : "Save Donor"}
              </motion.button>
            </motion.form>
          </motion.section>
        </div>

        {/* Put this in your global CSS to FIX dropdown option colors everywhere:
            select option { background:#0f172a; color:#e2e8f0; }
            .select option { background:#0f172a; color:#e2e8f0; }
        */}
      </main>
    </motion.div>
  );
}
