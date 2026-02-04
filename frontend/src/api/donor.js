// src/api/donor.js
// ✅ Clean + consistent API client:
// - DEV (Vite :5173): calls backend on :8080
// - PROD (built into CI public): calls same-origin
// - Base always includes "/api" so you never accidentally hit "/donors" (SPA HTML)

const DEV_BASE = "http://localhost:8080/api";

// If you build React into CI public (same origin), BASE becomes "/api" automatically.
const BASE_URL = import.meta?.env?.PROD ? "/api" : DEV_BASE;

/**
 * Read response safely + fail loudly if we expected JSON but got HTML (SPA fallback).
 */
async function toJson(res, { expectJson = true } = {}) {
  const text = await res.text();
  const contentType = (res.headers.get("content-type") || "").toLowerCase();

  const isJson =
    contentType.includes("application/json") ||
    contentType.includes("application/problem+json");

  let data = null;

  if (text) {
    if (isJson) {
      try {
        data = JSON.parse(text);
      } catch {
        // JSON header but invalid JSON body
        data = text;
      }
    } else {
      // HTML / text response
      data = text;
    }
  }

  // HTTP error first
  if (!res.ok) {
    const msg =
      (data && typeof data === "object" && (data.message || data.error)) ||
      (typeof data === "string" && data.slice(0, 220)) ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }

  // ✅ If API got swallowed by SPA fallback, CI returns HTML 200 -> fail loudly
  if (expectJson && !isJson) {
    throw new Error(
      `Expected JSON but got "${contentType || "unknown"}". ` +
        `Likely your /api route is being served by SPA fallback. ` +
        `First chars: ${String(text).slice(0, 220)}`
    );
  }

  return data;
}

/**
 * Find an array of items in many possible response shapes.
 */
function pickItems(root) {
  if (Array.isArray(root)) return root;

  const data = root?.data ?? root;

  const candidates = [
    data?.items,
    data?.donors,
    data?.results,
    data?.rows,

    root?.items,
    root?.donors,
    root?.results,
    root?.rows,

    // sometimes nested one more time
    data?.data,
    root?.data,
  ];

  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }

  return [];
}

/**
 * Pick meta/pagination object from many possible keys.
 */
function pickMeta(root) {
  const data = root?.data ?? root;

  return (
    data?.meta ||
    data?.pagination ||
    data?.pager ||
    root?.meta ||
    root?.pagination ||
    root?.pager ||
    null
  );
}

/**
 * Normalize meta to the shape your UI expects:
 * { page, per_page, total, page_count }
 */
function normalizeMeta(meta, fallback = {}) {
  if (!meta || typeof meta !== "object") return null;

  const page =
    meta.page ??
    meta.currentPage ??
    meta.current_page ??
    meta.pageNumber ??
    meta.page_number ??
    fallback.page;

  const per_page =
    meta.per_page ??
    meta.perPage ??
    meta.perpage ??
    meta.pageSize ??
    meta.page_size ??
    fallback.per_page;

  const total =
    meta.total ??
    meta.totalItems ??
    meta.total_items ??
    meta.count ??
    fallback.total;

  const page_count =
    meta.page_count ??
    meta.pageCount ??
    meta.pagecount ??
    meta.totalPages ??
    meta.total_pages ??
    fallback.page_count;

  return {
    page: Number(page ?? fallback.page ?? 1),
    per_page: Number(per_page ?? fallback.per_page ?? 10),
    total: Number(total ?? fallback.total ?? 0),
    page_count: Number(page_count ?? fallback.page_count ?? 1),
  };
}

/**
 * Unwrap anything into { items, meta, raw }
 */
function unwrapPayload(json, fallbackMeta) {
  const root = json ?? {};
  const items = pickItems(root);
  const rawMeta = pickMeta(root);
  const meta = normalizeMeta(rawMeta, fallbackMeta);
  return { items, meta, raw: root };
}

function buildQuery(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      qs.set(k, String(v));
    }
  });
  const s = qs.toString();
  return s ? `?${s}` : "";
}

/**
 * Fetch helper:
 * - path must be like "/donors" or "/donors/report" (NO "/api" prefix here)
 */
async function apiFetch(
  path,
  { method = "GET", params, body, expectJson = true } = {}
) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${BASE_URL}${cleanPath}${buildQuery(params)}`;

  const headers = { Accept: "application/json" };
  const init = { method, headers };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }

  const res = await fetch(url, init);
  return toJson(res, { expectJson });
}

export const donorsApi = {
  // GET /api/donors?page=1&per_page=10&search=...
  async listWithMeta(params = {}) {
    const json = await apiFetch("/donors", { params });

    // fallback meta if backend doesn't provide meta
    const fallbackMeta = {
      page: Number(params.page ?? 1),
      per_page: Number(params.per_page ?? 10),
      total: pickItems(json).length,
      page_count: 1,
    };

    return unwrapPayload(json, fallbackMeta);
  },

  // GET /api/donors
  async list(params = {}) {
    const json = await apiFetch("/donors", { params });
    return pickItems(json);
  },

  // GET /api/donors/report
  async report(params = {}) {
    return apiFetch("/donors/report", { params });
  },

  // POST /api/donors/store
  async create(payload) {
    return apiFetch("/donors/store", { method: "POST", body: payload });
  },

  // GET /api/donors/{id}
  async show(id) {
    return apiFetch(`/donors/${id}`);
  },

  // PUT /api/donors/update/{id}
  async update(id, payload) {
    return apiFetch(`/donors/update/${id}`, { method: "PUT", body: payload });
  },

  // DELETE /api/donors/delete/{id}
  async remove(id) {
    return apiFetch(`/donors/delete/${id}`, { method: "DELETE" });
  },
};
