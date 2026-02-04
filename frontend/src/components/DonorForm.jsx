import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button, GhostButton } from "./Button";

const segments = ["individual", "corporate", "foundation"];
const categories = ["recurring", "VIP", "major"];

export default function DonorForm({ initialValues, onSubmit, onCancel, loading }) {
  const defaults = useMemo(
    () => ({
      full_name: "",
      phone: "",
      email: "",
      blood_group: "",
      address: "",
      segment: "individual",
      category: "recurring",
      ...initialValues,
    }),
    [initialValues]
  );

  const [form, setForm] = useState(defaults);

  // ✅ IMPORTANT: update form if initialValues changes (edit mode)
  useEffect(() => {
    setForm(defaults);
  }, [defaults]);

  function setField(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit?.(form);
  }

  const item = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.04 } } }}
      >
        <motion.div variants={item}>
          <Field label="Full name">
            <Input value={form.full_name} onChange={(e) => setField("full_name", e.target.value)} />
          </Field>
        </motion.div>

        <motion.div variants={item}>
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => setField("phone", e.target.value)} />
          </Field>
        </motion.div>

        <motion.div variants={item}>
          <Field label="Email">
            <Input value={form.email} onChange={(e) => setField("email", e.target.value)} />
          </Field>
        </motion.div>

        <motion.div variants={item}>
          <Field label="Blood group">
            <Input
              value={form.blood_group}
              onChange={(e) => setField("blood_group", e.target.value)}
              placeholder="A+, O-, ..."
            />
          </Field>
        </motion.div>

        <motion.div variants={item}>
          <Field label="Segment">
            <Select value={form.segment} onChange={(e) => setField("segment", e.target.value)}>
              {segments.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
        </motion.div>

        <motion.div variants={item}>
          <Field label="Category">
            <Select value={form.category} onChange={(e) => setField("category", e.target.value)}>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
        </motion.div>
      </motion.div>

      <motion.div variants={item} initial="hidden" animate="show">
        <Field label="Address">
          <Textarea value={form.address} onChange={(e) => setField("address", e.target.value)} rows={3} />
        </Field>
      </motion.div>

      <div className="flex justify-end gap-2 pt-2">
        <GhostButton type="button" onClick={onCancel} disabled={loading}>
          Cancel
        </GhostButton>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Donor"}
          </Button>
        </motion.div>
      </div>
    </motion.form>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-sm text-slate-300 mb-1">{label}</div>
      {children}
    </label>
  );
}

/**
 * ✅ FIX for dropdown options:
 * - Your select had bg-slate-900 + text-white (fine)
 * - BUT <option> inherits weird default styling in many browsers (often white bg)
 * - So we force option background + text color.
 */
function baseInput() {
  return [
    "w-full rounded-xl",
    "bg-slate-900 border border-slate-800",
    "text-slate-100",
    "px-3 py-2",
    "outline-none focus:border-slate-600",
    "placeholder:text-slate-500",
    "disabled:opacity-60 disabled:cursor-not-allowed",
  ].join(" ");
}

function Input(props) {
  return <input className={baseInput()} {...props} />;
}

function Textarea(props) {
  return <textarea className={baseInput()} {...props} />;
}

function Select(props) {
  return (
    <select
      className={baseInput()}
      // ✅ This is the key: style options so they are readable when dropdown opens
      style={{ colorScheme: "dark" }} // helps some browsers render dropdown in dark mode
      {...props}
    />
  );
}

/* Put this in your global CSS (recommended) OR keep as Tailwind classes in options.
   Tailwind doesn't apply to <option> reliably across browsers, so global CSS is best:

   select option { background: #0f172a; color: #e2e8f0; }
*/
