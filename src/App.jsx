import { useEffect, useState } from "react";

function App() {
  const [alat, setAlat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    kode_alat: "",
    nama_alat: "",
    kategori: "",
    merk: "",
    spesifikasi: "",
    lokasi_rak: "",
    stok_total: "",
    stok_tersedia: "",
    kondisi: "",
  });

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // =========================
  // GET DATA
  // =========================
  const fetchAlat = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/alat_lab?select=*&order=id.asc`,
        {
          method: "GET",
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message || "Gagal mengambil data alat."
        );
      }

      const data = await response.json();

      setAlat(data);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlat();
  }, []);

  // =========================
  // HANDLE INPUT
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // RESET FORM
  // =========================
  const resetForm = () => {
    setForm({
      kode_alat: "",
      nama_alat: "",
      kategori: "",
      merk: "",
      spesifikasi: "",
      lokasi_rak: "",
      stok_total: "",
      stok_tersedia: "",
      kondisi: "",
    });

    setEditingId(null);
  };

  // =========================
  // EDIT DATA
  // =========================
  const handleEdit = (item) => {
    setEditingId(item.id);

    setForm({
      kode_alat: item.kode_alat || "",
      nama_alat: item.nama_alat || "",
      kategori: item.kategori || "",
      merk: item.merk || "",
      spesifikasi: item.spesifikasi || "",
      lokasi_rak: item.lokasi_rak || "",
      stok_total: item.stok_total ?? "",
      stok_tersedia: item.stok_tersedia ?? "",
      kondisi: item.kondisi || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // POST / PATCH
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.kode_alat.trim() ||
      !form.nama_alat.trim() ||
      !form.kategori.trim() ||
      form.stok_total === "" ||
      form.stok_tersedia === "" ||
      !form.kondisi
    ) {
      alert("Mohon isi semua data yang wajib diisi.");
      return;
    }

    if (
      Number(form.stok_total) < 0 ||
      Number(form.stok_tersedia) < 0
    ) {
      alert("Stok tidak boleh bernilai negatif.");
      return;
    }

    if (Number(form.stok_tersedia) > Number(form.stok_total)) {
      alert("Stok tersedia tidak boleh lebih besar dari stok total.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        kode_alat: form.kode_alat.trim(),
        nama_alat: form.nama_alat.trim(),
        kategori: form.kategori.trim(),
        merk: form.merk.trim(),
        spesifikasi: form.spesifikasi.trim(),
        lokasi_rak: form.lokasi_rak.trim(),
        stok_total: Number(form.stok_total),
        stok_tersedia: Number(form.stok_tersedia),
        kondisi: form.kondisi,
      };

      let response;

      // =========================
      // PATCH
      // =========================
      if (editingId !== null) {
        response = await fetch(
          `${SUPABASE_URL}/rest/v1/alat_lab?id=eq.${editingId}`,
          {
            method: "PATCH",
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
              "Content-Type": "application/json",
              Prefer: "return=representation",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);

          throw new Error(
            errorData?.message || "Gagal memperbarui data alat."
          );
        }

        alert("Data alat berhasil diperbarui.");
      }

      // =========================
      // POST
      // =========================
      else {
        response = await fetch(`${SUPABASE_URL}/rest/v1/alat_lab`, {
          method: "POST",
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);

          throw new Error(
            errorData?.message || "Gagal menambahkan data alat."
          );
        }

        alert("Data alat berhasil ditambahkan.");
      }

      resetForm();
      await fetchAlat();
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE DATA
  // =========================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      `Apakah Lu yakin ingin menghapus data alat dengan ID #${id}?`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setDeletingId(id);

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/alat_lab?id=eq.${id}`,
        {
          method: "DELETE",
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message || "Gagal menghapus data alat."
        );
      }

      alert("Data alat berhasil dihapus.");

      if (editingId === id) {
        resetForm();
      }

      await fetchAlat();
    } catch (error) {
      alert(error.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Data Alat Laboratorium</h1>

            <p style={styles.subtitle}>
              Kelola data alat yang tersimpan di database.
            </p>
          </div>

          <button
            type="button"
            style={styles.refreshButton}
            onClick={fetchAlat}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </div>

        {/* FORM */}
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <div>
              <h2 style={styles.formTitle}>
                {editingId !== null
                  ? "Edit Data Alat"
                  : "Tambah Data Alat"}
              </h2>

              <p style={styles.formSubtitle}>
                {editingId !== null
                  ? `Sedang mengedit data dengan ID #${editingId}`
                  : "Masukkan informasi alat laboratorium."}
              </p>
            </div>

            {editingId !== null && (
              <button
                type="button"
                onClick={resetForm}
                style={styles.cancelEditButton}
                disabled={saving}
              >
                Batal Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Kode Alat</label>

                <input
                  type="text"
                  name="kode_alat"
                  value={form.kode_alat}
                  onChange={handleChange}
                  placeholder="Contoh: ALT-001"
                  autoComplete="off"
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Nama Alat</label>

                <input
                  type="text"
                  name="nama_alat"
                  value={form.nama_alat}
                  onChange={handleChange}
                  placeholder="Contoh: Multimeter"
                  autoComplete="off"
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Kategori</label>

                <input
                  type="text"
                  name="kategori"
                  value={form.kategori}
                  onChange={handleChange}
                  placeholder="Contoh: Elektronik"
                  autoComplete="off"
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Merk</label>

                <input
                  type="text"
                  name="merk"
                  value={form.merk}
                  onChange={handleChange}
                  placeholder="Contoh: Sanwa"
                  autoComplete="off"
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Lokasi Rak</label>

                <input
                  type="text"
                  name="lokasi_rak"
                  value={form.lokasi_rak}
                  onChange={handleChange}
                  placeholder="Contoh: Rak A1"
                  autoComplete="off"
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Kondisi</label>

                <select
                  name="kondisi"
                  value={form.kondisi}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="">Pilih kondisi</option>
                  <option value="Baik">Baik</option>
                  <option value="Perbaikan">Perbaikan</option>
                  <option value="Rusak">Rusak</option>
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Stok Total</label>

                <input
                  type="number"
                  name="stok_total"
                  value={form.stok_total}
                  onChange={handleChange}
                  min="0"
                  placeholder="0"
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Stok Tersedia</label>

                <input
                  type="number"
                  name="stok_tersedia"
                  value={form.stok_tersedia}
                  onChange={handleChange}
                  min="0"
                  placeholder="0"
                  style={styles.input}
                />
              </div>

              <div
                style={{
                  ...styles.inputGroup,
                  gridColumn: "1 / -1",
                }}
              >
                <label style={styles.label}>Spesifikasi</label>

                <textarea
                  name="spesifikasi"
                  value={form.spesifikasi}
                  onChange={handleChange}
                  placeholder="Masukkan spesifikasi alat..."
                  rows={3}
                  style={{
                    ...styles.input,
                    resize: "vertical",
                    minHeight: "80px",
                  }}
                />
              </div>
            </div>

            <div style={styles.formActions}>
              <button
                type="button"
                onClick={resetForm}
                style={styles.cancelButton}
                disabled={saving}
              >
                Reset
              </button>

              <button
                type="submit"
                style={{
                  ...styles.submitButton,
                  backgroundColor:
                    editingId !== null ? "#f59e0b" : "#2563eb",
                }}
                disabled={saving}
              >
                {saving
                  ? "Menyimpan..."
                  : editingId !== null
                  ? "Simpan Perubahan"
                  : "+ Tambah Data"}
              </button>
            </div>
          </form>
        </div>

        {/* TABLE */}
        <div style={styles.tableSection}>
          <div style={styles.tableHeader}>
            <div>
              <h2 style={styles.tableTitle}>Daftar Alat</h2>

              <p style={styles.tableSubtitle}>
                {alat.length} data alat ditemukan
              </p>
            </div>
          </div>

          {loading ? (
            <div style={styles.loading}>Memuat data...</div>
          ) : alat.length === 0 ? (
            <div style={styles.empty}>Belum ada data alat.</div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Kode Alat</th>
                    <th style={styles.th}>Nama Alat</th>
                    <th style={styles.th}>Kategori</th>
                    <th style={styles.th}>Merk</th>
                    <th style={styles.th}>Spesifikasi</th>
                    <th style={styles.th}>Lokasi Rak</th>
                    <th style={styles.th}>Stok Total</th>
                    <th style={styles.th}>Stok Tersedia</th>
                    <th style={styles.th}>Kondisi</th>
                    <th style={styles.th}>Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {alat.map((item) => (
                    <tr key={item.id}>
                      <td style={styles.td}>{item.id}</td>

                      <td style={styles.td}>
                        {item.kode_alat}
                      </td>

                      <td style={styles.td}>
                        {item.nama_alat}
                      </td>

                      <td style={styles.td}>
                        {item.kategori}
                      </td>

                      <td style={styles.td}>
                        {item.merk || "-"}
                      </td>

                      <td style={styles.td}>
                        {item.spesifikasi || "-"}
                      </td>

                      <td style={styles.td}>
                        {item.lokasi_rak || "-"}
                      </td>

                      <td style={styles.td}>
                        {item.stok_total}
                      </td>

                      <td style={styles.td}>
                        {item.stok_tersedia}
                      </td>

                      <td style={styles.td}>
                        {item.kondisi}
                      </td>

                      <td style={styles.actionTd}>
                        <div style={styles.actionWrapper}>
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            style={styles.editButton}
                            disabled={
                              saving || deletingId !== null
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            style={styles.deleteButton}
                            disabled={
                              saving || deletingId !== null
                            }
                          >
                            {deletingId === item.id
                              ? "Menghapus..."
                              : "Hapus"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "40px",
    backgroundColor: "#f4f6f8",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
  },

  card: {
    maxWidth: "1400px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "30px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
    gap: "20px",
  },

  title: {
    margin: 0,
    fontSize: "28px",
    color: "#1f2937",
  },

  subtitle: {
    margin: "8px 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },

  refreshButton: {
    border: "none",
    borderRadius: "8px",
    padding: "10px 18px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  formCard: {
    marginBottom: "30px",
    padding: "25px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
  },

  formHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
    gap: "15px",
  },

  formTitle: {
    margin: 0,
    fontSize: "20px",
    color: "#1f2937",
  },

  formSubtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
    fontSize: "13px",
  },

  cancelEditButton: {
    padding: "8px 13px",
    border: "1px solid #fca5a5",
    borderRadius: "7px",
    backgroundColor: "#fff1f2",
    color: "#dc2626",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "18px",
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },

  label: {
    marginBottom: "7px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    backgroundColor: "#ffffff",
    color: "#1f2937",
    fontSize: "14px",
    outline: "none",
    fontFamily: "Arial, sans-serif",
  },

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
  },

  cancelButton: {
    padding: "10px 18px",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    backgroundColor: "#ffffff",
    color: "#374151",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },

  submitButton: {
    padding: "10px 18px",
    border: "none",
    borderRadius: "7px",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },

  tableSection: {
    marginTop: "10px",
  },

  tableHeader: {
    marginBottom: "15px",
  },

  tableTitle: {
    margin: 0,
    fontSize: "20px",
    color: "#1f2937",
  },

  tableSubtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
    fontSize: "13px",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1450px",
  },

  th: {
    padding: "14px",
    backgroundColor: "#f3f4f6",
    borderBottom: "2px solid #e5e7eb",
    textAlign: "left",
    fontSize: "14px",
    color: "#374151",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "14px",
    borderBottom: "1px solid #e5e7eb",
    fontSize: "14px",
    color: "#4b5563",
    verticalAlign: "top",
  },

  actionTd: {
    padding: "14px",
    borderBottom: "1px solid #e5e7eb",
    verticalAlign: "top",
  },

  actionWrapper: {
    display: "flex",
    gap: "7px",
  },

  editButton: {
    padding: "7px 13px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#f59e0b",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },

  deleteButton: {
    padding: "7px 13px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#dc2626",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },

  loading: {
    padding: "40px",
    textAlign: "center",
    color: "#6b7280",
  },

  empty: {
    padding: "40px",
    textAlign: "center",
    color: "#6b7280",
  },
};

export default App;