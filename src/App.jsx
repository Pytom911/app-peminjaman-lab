import React, { useEffect, useState } from "react";
// Import Icon untuk Web dari react-icons
import { 
  FaHome, FaBox, FaExchangeAlt, FaUserAlt, FaChevronDown, 
  FaSyncAlt, FaPen, FaTrash, FaSpinner, FaTimes 
} from "react-icons/fa";

// Sesuaikan path gambar jika file ada di src/assets
import profileImg from "./assets/profile.png"; 

// =============================================================
// DESIGN TOKENS (Biru & Putih Modern - UI Baru)
// =============================================================

const C = {
  bg: "#F0F4F8",
  surface: "#FFFFFF",
  border: "#E2E8F0",
  borderStrong: "#CBD5E1",
  text: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  accent: "#0062FF",
  accentLight: "#E5F0FF",
  accentDark: "#004BCC",
  green: "#059669",
  greenLight: "#D1FAE5",
  amber: "#D97706",
  amberLight: "#FEF3C7",
  red: "#DC2626",
  redLight: "#FEE2E2",
};

const STATUS_META = {
  baik: { color: C.green, bg: C.greenLight },
  dikembalikan: { color: C.green, bg: C.greenLight },
  perbaikan: { color: C.amber, bg: C.amberLight },
  dipinjam: { color: C.amber, bg: C.amberLight },
  rusak: { color: C.red, bg: C.redLight },
  terlambat: { color: C.red, bg: C.redLight },
};

const getStatus = (value) => {
  const key = String(value || "").toLowerCase();
  return STATUS_META[key] || { color: C.textSecondary, bg: C.border };
};

// =============================================================
// CONSTANTS
// =============================================================

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

const initialAlatForm = {
  kode_alat: "", nama_alat: "", kategori: "", merk: "",
  spesifikasi: "", lokasi_rak: "", stok_total: "",
  stok_tersedia: "", kondisi: "",
};

const initialPeminjamanForm = {
  alat_id: "", nama_peminjam: "", tgl_pinjam: "",
  tgl_kembali: "", status_pinjam: "",
};

// =============================================================
// REUSABLE UI COMPONENTS
// =============================================================

function Input({ label, value, onChangeText, placeholder, type = "text", multiline = false }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={s.inputGroup}>
      <label style={s.label}>{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ ...s.input, ...s.textArea, ...(focused ? s.inputFocus : {}) }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ ...s.input, ...(focused ? s.inputFocus : {}) }}
        />
      )}
    </div>
  );
}

function Select({ label, value, placeholder, onPress }) {
  return (
    <div style={s.inputGroup}>
      <label style={s.label}>{label}</label>
      <button 
        type="button" 
        onClick={onPress} 
        style={{ ...s.input, ...s.select }}
      >
        <span style={!value ? s.placeholderText : s.selectText}>
          {value || placeholder}
        </span>
        <FaChevronDown size={12} color={C.textMuted} />
      </button>
    </div>
  );
}

function Status({ value }) {
  const meta = getStatus(value);
  return (
    <div style={{ ...s.pill, backgroundColor: meta.bg }}>
      <span style={{ ...s.pillText, color: meta.color }}>{value}</span>
    </div>
  );
}

function Panel({ title, aside, children, style, noPadding = false }) {
  return (
    <div style={{ ...s.panel, ...style }}>
      <div style={s.panelHead}>
        <span style={s.panelTitle}>{title}</span>
        {aside}
      </div>
      <div style={noPadding ? {} : s.panelBody}>{children}</div>
    </div>
  );
}

// =============================================================
// MAIN APP
// =============================================================

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const [alat, setAlat] = useState([]);
  const [loadingAlat, setLoadingAlat] = useState(true);
  const [savingAlat, setSavingAlat] = useState(false);
  const [deletingAlatId, setDeletingAlatId] = useState(null);
  const [editingAlatId, setEditingAlatId] = useState(null);
  const [alatForm, setAlatForm] = useState(initialAlatForm);

  const [peminjaman, setPeminjaman] = useState([]);
  const [loadingPeminjaman, setLoadingPeminjaman] = useState(true);
  const [savingPeminjaman, setSavingPeminjaman] = useState(false);
  const [deletingPeminjamanId, setDeletingPeminjamanId] = useState(null);
  const [editingPeminjamanId, setEditingPeminjamanId] = useState(null);
  const [peminjamanForm, setPeminjamanForm] = useState(initialPeminjamanForm);

  const [alatModalVisible, setAlatModalVisible] = useState(false);
  const [kondisiModalVisible, setKondisiModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);

  // LOGIKA LAMA: Menggunakan Logika aslimu untuk headers dan error handling
  const getHeaders = () => ({
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  });

  const getErrorMessage = (error, fallback) => {
    if (error && error.message) return error.message;
    return fallback;
  };

  // ===========================================================
  // FETCH LOGIC (Logika Lama)
  // ===========================================================

  const fetchAlat = async () => {
    try {
      setLoadingAlat(true);
      const res = await fetch(`${SUPABASE_URL}/rest/v1/alat_lab?select=*&order=id.asc`, { method: "GET", headers: getHeaders() });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || "Gagal mengambil data alat.");
      }
      setAlat(await res.json());
    } catch (err) {
      window.alert("Error: " + getErrorMessage(err, "Gagal mengambil data alat."));
    } finally {
      setLoadingAlat(false);
    }
  };

  const fetchPeminjaman = async () => {
    try {
      setLoadingPeminjaman(true);
      const res = await fetch(`${SUPABASE_URL}/rest/v1/peminjaman_alat?select=*&order=id.asc`, { method: "GET", headers: getHeaders() });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || "Gagal mengambil data peminjaman.");
      }
      setPeminjaman(await res.json());
    } catch (err) {
      window.alert("Error: " + getErrorMessage(err, "Gagal mengambil data peminjaman."));
    } finally {
      setLoadingPeminjaman(false);
    }
  };

  useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      window.alert("Environment Error: Pastikan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY tersedia di .env.");
      return;
    }
    fetchAlat();
    fetchPeminjaman();
  }, []);

  // ===========================================================
  // FORM HANDLERS (Logika Lama)
  // ===========================================================

  const updateAlatForm = (f, v) => setAlatForm((p) => ({ ...p, [f]: v }));
  const updatePeminjamanForm = (f, v) => setPeminjamanForm((p) => ({ ...p, [f]: v }));

  const resetAlatForm = () => {
    setAlatForm({ ...initialAlatForm });
    setEditingAlatId(null);
  };
  
  const resetPeminjamanForm = () => {
    setPeminjamanForm({ ...initialPeminjamanForm });
    setEditingPeminjamanId(null);
  };

  const handleEditAlat = (item) => {
    setEditingAlatId(item.id);
    setAlatForm({
      kode_alat: item.kode_alat || "", nama_alat: item.nama_alat || "",
      kategori: item.kategori || "", merk: item.merk || "",
      spesifikasi: item.spesifikasi || "", lokasi_rak: item.lokasi_rak || "",
      stok_total: String(item.stok_total ?? ""), stok_tersedia: String(item.stok_tersedia ?? ""),
      kondisi: item.kondisi || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditPeminjaman = (item) => {
    setEditingPeminjamanId(item.id);
    setPeminjamanForm({
      alat_id: String(item.alat_id ?? ""), nama_peminjam: item.nama_peminjam || "",
      tgl_pinjam: item.tgl_pinjam || "", tgl_kembali: item.tgl_kembali || "",
      status_pinjam: item.status_pinjam || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmitAlat = async () => {
    if (!alatForm.kode_alat.trim() || !alatForm.nama_alat.trim() || !alatForm.kategori.trim() || alatForm.stok_total === "" || alatForm.stok_tersedia === "" || !alatForm.kondisi) {
      window.alert("Validasi: Mohon isi semua data alat yang wajib diisi.");
      return;
    }
    const stokTotal = Number(alatForm.stok_total);
    const stokTersedia = Number(alatForm.stok_tersedia);
    
    if (!Number.isInteger(stokTotal) || !Number.isInteger(stokTersedia)) {
      window.alert("Validasi: Stok harus berupa angka bulat."); return;
    }
    if (stokTotal < 0 || stokTersedia < 0) {
      window.alert("Validasi: Stok tidak boleh bernilai negatif."); return;
    }
    if (stokTersedia > stokTotal) {
      window.alert("Validasi: Stok tersedia tidak boleh lebih besar dari stok total."); return;
    }

    try {
      setSavingAlat(true);
      const payload = {
        kode_alat: alatForm.kode_alat.trim(),
        nama_alat: alatForm.nama_alat.trim(),
        kategori: alatForm.kategori.trim(),
        merk: alatForm.merk.trim(),
        spesifikasi: alatForm.spesifikasi.trim(),
        lokasi_rak: alatForm.lokasi_rak.trim(),
        stok_total: stokTotal,
        stok_tersedia: stokTersedia,
        kondisi: alatForm.kondisi,
      };

      let res;
      if (editingAlatId !== null) {
        res = await fetch(`${SUPABASE_URL}/rest/v1/alat_lab?id=eq.${editingAlatId}`, {
          method: "PATCH", headers: { ...getHeaders(), Prefer: "return=representation" }, body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${SUPABASE_URL}/rest/v1/alat_lab`, {
          method: "POST", headers: { ...getHeaders(), Prefer: "return=representation" }, body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || "Gagal menyimpan data alat.");
      }
      
      window.alert(editingAlatId !== null ? "Berhasil: Data alat berhasil diperbarui." : "Berhasil: Data alat berhasil ditambahkan.");
      resetAlatForm();
      await fetchAlat();
    } catch (err) {
      window.alert("Error: " + getErrorMessage(err, "Gagal menyimpan data alat."));
    } finally {
      setSavingAlat(false);
    }
  };

  const handleDeleteAlat = (id) => {
    const isConfirm = window.confirm(`Apakah Lu yakin ingin menghapus alat dengan ID #${id}?`);
    if(isConfirm) {
      const runDelete = async () => {
        try {
          setDeletingAlatId(id);
          const res = await fetch(`${SUPABASE_URL}/rest/v1/alat_lab?id=eq.${id}`, { method: "DELETE", headers: getHeaders() });
          if (!res.ok) {
            const err = await res.json().catch(() => null);
            throw new Error(err?.message || "Gagal menghapus data alat.");
          }
          if (editingAlatId === id) resetAlatForm();
          window.alert("Berhasil: Data alat berhasil dihapus.");
          await fetchAlat();
          await fetchPeminjaman();
        } catch (err) {
          window.alert("Error: " + getErrorMessage(err, "Gagal menghapus data alat."));
        } finally {
          setDeletingAlatId(null);
        }
      };
      runDelete();
    }
  };

  const handleSubmitPeminjaman = async () => {
    if (!peminjamanForm.alat_id || !peminjamanForm.nama_peminjam.trim() || !peminjamanForm.tgl_pinjam || !peminjamanForm.status_pinjam) {
      window.alert("Validasi: Mohon isi alat, nama peminjam, tanggal pinjam, dan status."); return;
    }
    const tanggalPinjam = peminjamanForm.tgl_pinjam.trim();
    const tanggalKembali = peminjamanForm.tgl_kembali.trim();
    
    if (tanggalKembali && tanggalKembali < tanggalPinjam) {
      window.alert("Validasi: Tanggal kembali tidak boleh lebih awal dari tanggal pinjam."); return;
    }
    
    try {
      setSavingPeminjaman(true);
      const payload = {
        alat_id: Number(peminjamanForm.alat_id),
        nama_peminjam: peminjamanForm.nama_peminjam.trim(),
        tgl_pinjam: tanggalPinjam,
        tgl_kembali: tanggalKembali || null,
        status_pinjam: peminjamanForm.status_pinjam,
      };

      let res;
      if (editingPeminjamanId !== null) {
        res = await fetch(`${SUPABASE_URL}/rest/v1/peminjaman_alat?id=eq.${editingPeminjamanId}`, {
          method: "PATCH", headers: { ...getHeaders(), Prefer: "return=representation" }, body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${SUPABASE_URL}/rest/v1/peminjaman_alat`, {
          method: "POST", headers: { ...getHeaders(), Prefer: "return=representation" }, body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || "Gagal menyimpan data peminjaman.");
      }
      
      window.alert(editingPeminjamanId !== null ? "Berhasil: Data peminjaman berhasil diperbarui." : "Berhasil: Data peminjaman berhasil ditambahkan.");
      resetPeminjamanForm();
      await fetchPeminjaman();
    } catch (err) {
      window.alert("Error: " + getErrorMessage(err, "Gagal menyimpan data peminjaman."));
    } finally {
      setSavingPeminjaman(false);
    }
  };

  const handleDeletePeminjaman = (id) => {
    const isConfirm = window.confirm(`Apakah Lu yakin ingin menghapus peminjaman dengan ID #${id}?`);
    if(isConfirm){
      const runDelete = async () => {
        try {
          setDeletingPeminjamanId(id);
          const res = await fetch(`${SUPABASE_URL}/rest/v1/peminjaman_alat?id=eq.${id}`, { method: "DELETE", headers: getHeaders() });
          if (!res.ok) {
            const err = await res.json().catch(() => null);
            throw new Error(err?.message || "Gagal menghapus data peminjaman.");
          }
          if (editingPeminjamanId === id) resetPeminjamanForm();
          window.alert("Berhasil: Data peminjaman berhasil dihapus.");
          await fetchPeminjaman();
        } catch (err) {
          window.alert("Error: " + getErrorMessage(err, "Gagal menghapus data peminjaman."));
        } finally {
          setDeletingPeminjamanId(null);
        }
      }
      runDelete();
    }
  };

  const getNamaAlat = (alatId) => {
    const item = alat.find((d) => Number(d.id) === Number(alatId));
    if (!item) return { title: `ID #${alatId}`, sub: null };
    return { title: item.nama_alat, sub: item.kode_alat };
  };

  // ===========================================================
  // DASHBOARD DATA AGGREGATION
  // ===========================================================
  const totalJenis = alat.length;
  const totalStok = alat.reduce((a, c) => a + (Number(c.stok_total) || 0), 0);
  const totalTersedia = alat.reduce((a, c) => a + (Number(c.stok_tersedia) || 0), 0);
  const totalDipinjam = peminjaman.filter(p => p.status_pinjam.toLowerCase() === "dipinjam" || p.status_pinjam.toLowerCase() === "terlambat").length;

  const lowStock = alat.filter((a) => Number(a.stok_tersedia) <= 2).sort((a, b) => a.stok_tersedia - b.stok_tersedia).slice(0, 5);
  const recentLoans = [...peminjaman].sort((a, b) => b.id - a.id).slice(0, 5);

  const tabs = [
    { key: "dashboard", label: "Home", icon: <FaHome size={20} /> },
    { key: "alat", label: "Inventori", icon: <FaBox size={20} /> },
    { key: "peminjaman", label: "Sirkulasi", icon: <FaExchangeAlt size={20} /> },
    { key: "about", label: "Profil", icon: <FaUserAlt size={20} /> },
  ];

  return (
    <div style={s.safeArea}>
      
      {/* ─── MOBILE TOP HEADER ─── */}
      <div style={s.header}>
        <div>
          <h1 style={s.headerTitle}>Lab<span style={{color: C.accent}}>Manager</span></h1>
          <p style={s.headerSub}>SMK PPLG Dashboard</p>
        </div>
        <img src={profileImg} alt="Profile" style={s.headerAvatar} />
      </div>

      <div style={s.container}>
        <div style={s.content}>
          
          {/* ───────────────────────────────────────────────────
              DASHBOARD
          ──────────────────────────────────────────────────── */}
          {activeTab === "dashboard" && (
            <div style={s.dashLayout}>
              {/* COMPACT STATS GRID */}
              <div style={s.statGrid}>
                <div style={s.statCard}>
                  <p style={s.statTitle}>Total Jenis Alat</p>
                  <p style={s.statValue}>{totalJenis}</p>
                </div>
                <div style={s.statCard}>
                  <p style={s.statTitle}>Stok Keseluruhan</p>
                  <p style={s.statValue}>{totalStok}</p>
                </div>
                <div style={s.statCard}>
                  <p style={s.statTitle}>Stok Tersedia</p>
                  <p style={{...s.statValue, color: C.accent}}>{totalTersedia}</p>
                </div>
                <div style={s.statCard}>
                  <p style={s.statTitle}>Aktif Dipinjam</p>
                  <p style={s.statValue}>{totalDipinjam}</p>
                </div>
              </div>

              {/* PANELS */}
              <Panel title="Stok Menipis" aside={<span style={s.panelBadge}>{lowStock.length}</span>} noPadding>
                {lowStock.length === 0 ? <p style={s.emptyState}>Semua stok aman</p> : 
                  lowStock.map((item, i) => (
                    <div key={item.id} style={{...s.listItem, ...(i === lowStock.length-1 ? s.noBorder : {})}}>
                      <div style={s.listMain}>
                        <p style={s.itemTitle}>{item.nama_alat}</p>
                        <p style={s.itemSub}>{item.kode_alat} • {item.lokasi_rak || "—"}</p>
                      </div>
                      <div style={{display: 'flex', flexDirection: 'column', alignItems: "flex-end"}}>
                        <p style={s.itemValue}><span style={{color: C.text}}>{item.stok_tersedia}</span> / {item.stok_total}</p>
                        <p style={{...s.itemFlag, color: item.stok_tersedia === 0 ? C.red : C.amber}}>
                          {item.stok_tersedia === 0 ? "Habis" : "Menipis"}
                        </p>
                      </div>
                    </div>
                  ))
                }
              </Panel>

              <Panel title="Aktivitas Terbaru" aside={<span style={s.panelBadge}>{recentLoans.length}</span>} noPadding>
                {recentLoans.length === 0 ? <p style={s.emptyState}>Belum ada aktivitas</p> : 
                  recentLoans.map((item, i) => {
                    const al = getNamaAlat(item.alat_id);
                    return (
                    <div key={item.id} style={{...s.listItem, ...(i === recentLoans.length-1 ? s.noBorder : {})}}>
                      <div style={s.avatarCir}><span style={s.avatarTxt}>{(item.nama_peminjam || "?").slice(0,1).toUpperCase()}</span></div>
                      <div style={s.listMain}>
                        <p style={s.itemTitle}>{item.nama_peminjam}</p>
                        <p style={s.itemSub}>{al.title}</p>
                      </div>
                      <div style={{display: 'flex', flexDirection: 'column', alignItems: "flex-end"}}>
                        <p style={s.itemDate}>{item.tgl_pinjam}</p>
                        <Status value={item.status_pinjam} />
                      </div>
                    </div>
                  )})
                }
              </Panel>
            </div>
          )}

          {/* ───────────────────────────────────────────────────
              DATA ALAT / INVENTORI
          ──────────────────────────────────────────────────── */}
          {activeTab === "alat" && (
            <div style={s.dashLayout}>
              <Panel title={editingAlatId ? "Edit Alat" : "Tambah Alat Baru"}>
                <Input label="Kode Alat" value={alatForm.kode_alat} onChangeText={(v) => updateAlatForm("kode_alat", v)} placeholder="ALT-001" />
                <Input label="Nama Alat" value={alatForm.nama_alat} onChangeText={(v) => updateAlatForm("nama_alat", v)} placeholder="Multimeter" />
                <div style={s.row}>
                  <div style={s.flex}><Input label="Kategori" value={alatForm.kategori} onChangeText={(v) => updateAlatForm("kategori", v)} placeholder="Elektronik" /></div>
                  <div style={s.flex}><Input label="Merk" value={alatForm.merk} onChangeText={(v) => updateAlatForm("merk", v)} placeholder="Sanwa" /></div>
                </div>
                <div style={s.row}>
                  <div style={s.flex}><Input label="Lokasi Rak" value={alatForm.lokasi_rak} onChangeText={(v) => updateAlatForm("lokasi_rak", v)} placeholder="Rak A1" /></div>
                  <div style={s.flex}><Select label="Kondisi" value={alatForm.kondisi} placeholder="Pilih..." onPress={() => setKondisiModalVisible(true)} /></div>
                </div>
                <div style={s.row}>
                  <div style={s.flex}><Input label="Stok Total" value={alatForm.stok_total} onChangeText={(v) => updateAlatForm("stok_total", v)} type="number" placeholder="0" /></div>
                  <div style={s.flex}><Input label="Tersedia" value={alatForm.stok_tersedia} onChangeText={(v) => updateAlatForm("stok_tersedia", v)} type="number" placeholder="0" /></div>
                </div>
                <Input label="Spesifikasi" value={alatForm.spesifikasi} onChangeText={(v) => updateAlatForm("spesifikasi", v)} placeholder="Deskripsi spesifikasi alat..." multiline />
                
                <div style={s.formAction}>
                  <button type="button" onClick={resetAlatForm} disabled={savingAlat} style={s.btnGhost}>Batal</button>
                  <button type="button" onClick={handleSubmitAlat} disabled={savingAlat} style={s.btnPrimary}>
                    {savingAlat ? <FaSpinner className="spin" size={14} color="#fff" /> : <span>{editingAlatId ? "Simpan" : "Tambah"}</span>}
                  </button>
                </div>
              </Panel>

              {/* Data Table */}
              <div style={s.panel}>
                <div style={s.panelHead}>
                  <span style={s.panelTitle}>Daftar Inventori ({alat.length})</span>
                  <button type="button" onClick={fetchAlat} style={s.iconButton}>
                    <FaSyncAlt size={14} color={C.accent} />
                  </button>
                </div>
                <div style={s.tableScroll}>
                  <div style={{ minWidth: 800 }}>
                    <div style={s.tbHead}>
                      {["KODE", "NAMA ALAT", "KATEGORI", "S.TOTAL", "S.TERSEDIA", "KONDISI", "AKSI"].map((h) => 
                        <span key={h} style={{...s.tbCell, ...s.tbCellHead, width: h==="NAMA ALAT" ? 140 : h==="AKSI"? 120 : 90}}>{h}</span>
                      )}
                    </div>
                    {alat.map((item) => (
                      <div key={item.id} style={s.tbRow}>
                        <span style={{...s.tbCell, ...s.fontMono, width: 90}}>{item.kode_alat}</span>
                        <span style={{...s.tbCell, width: 140, fontWeight:"600", color:C.text}}>{item.nama_alat}</span>
                        <span style={{...s.tbCell, width: 90}}>{item.kategori}</span>
                        <span style={{...s.tbCell, ...s.fontMono, width: 90}}>{item.stok_total}</span>
                        <span style={{...s.tbCell, ...s.fontMono, width: 90, color: item.stok_tersedia > 0 ? C.text : C.red}}>{item.stok_tersedia}</span>
                        <div style={{...s.tbCell, width: 90, display: 'flex', alignItems: 'center'}}><Status value={item.kondisi} /></div>
                        
                        <div style={{...s.tbCell, ...s.row, width: 120, alignItems: 'center'}}>
                           <button type="button" onClick={() => handleEditAlat(item)} disabled={savingAlat || deletingAlatId !== null} style={s.btnAction}>
                             <FaPen size={11} color={C.accent} />
                           </button>
                           <button type="button" onClick={() => handleDeleteAlat(item.id)} disabled={savingAlat || deletingAlatId !== null} style={{...s.btnAction, backgroundColor: C.redLight}}>
                             {deletingAlatId === item.id ? <FaSpinner className="spin" size={11} color={C.red} /> : <FaTrash size={11} color={C.red} />}
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────
              PEMINJAMAN
          ──────────────────────────────────────────────────── */}
          {activeTab === "peminjaman" && (
            <div style={s.dashLayout}>
              <Panel title={editingPeminjamanId ? "Edit Peminjaman" : "Catat Peminjaman Baru"}>
                <Select label="Pilih Alat" value={peminjamanForm.alat_id ? getNamaAlat(peminjamanForm.alat_id).title : ""} placeholder="Ketuk untuk memilih alat..." onPress={() => setAlatModalVisible(true)} />
                <Input label="Nama Peminjam" value={peminjamanForm.nama_peminjam} onChangeText={(v) => updatePeminjamanForm("nama_peminjam", v)} placeholder="Masukkan nama..." />
                <div style={s.row}>
                  <div style={s.flex}><Input label="Tgl Pinjam" type="date" value={peminjamanForm.tgl_pinjam} onChangeText={(v) => updatePeminjamanForm("tgl_pinjam", v)} placeholder="YYYY-MM-DD" /></div>
                  <div style={s.flex}><Input label="Tgl Kembali" type="date" value={peminjamanForm.tgl_kembali} onChangeText={(v) => updatePeminjamanForm("tgl_kembali", v)} placeholder="YYYY-MM-DD" /></div>
                </div>
                <Select label="Status" value={peminjamanForm.status_pinjam} placeholder="Pilih status..." onPress={() => setStatusModalVisible(true)} />
                
                <div style={s.formAction}>
                  <button type="button" onClick={resetPeminjamanForm} disabled={savingPeminjaman} style={s.btnGhost}>Batal</button>
                  <button type="button" onClick={handleSubmitPeminjaman} disabled={savingPeminjaman} style={s.btnPrimary}>
                    {savingPeminjaman ? <FaSpinner className="spin" size={14} color="#fff" /> : <span>{editingPeminjamanId ? "Simpan" : "Tambah"}</span>}
                  </button>
                </div>
              </Panel>

              {/* Data Table Peminjaman */}
              <div style={s.panel}>
                <div style={s.panelHead}>
                  <span style={s.panelTitle}>Riwayat Sirkulasi ({peminjaman.length})</span>
                  <button type="button" onClick={fetchPeminjaman} style={s.iconButton}>
                    <FaSyncAlt size={14} color={C.accent} />
                  </button>
                </div>
                <div style={s.tableScroll}>
                  <div style={{ minWidth: 700 }}>
                    <div style={s.tbHead}>
                      {["PEMINJAM", "ALAT", "TGL PINJAM", "TGL KEMBALI", "STATUS", "AKSI"].map((h) => 
                        <span key={h} style={{...s.tbCell, ...s.tbCellHead, width: h==="PEMINJAM"||h==="ALAT" ? 130 : h==="AKSI"? 110 : 100}}>{h}</span>
                      )}
                    </div>
                    {peminjaman.map((item) => {
                      const alatInfo = getNamaAlat(item.alat_id);
                      return (
                      <div key={item.id} style={s.tbRow}>
                        <span style={{...s.tbCell, width: 130, fontWeight:"600", color:C.text}}>{item.nama_peminjam}</span>
                        <span style={{...s.tbCell, width: 130, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{alatInfo.title}</span>
                        <span style={{...s.tbCell, ...s.fontMono, width: 100}}>{item.tgl_pinjam}</span>
                        <span style={{...s.tbCell, ...s.fontMono, width: 100}}>{item.tgl_kembali || "—"}</span>
                        <div style={{...s.tbCell, width: 100, display: 'flex', alignItems: 'center'}}><Status value={item.status_pinjam} /></div>
                        
                        <div style={{...s.tbCell, ...s.row, width: 110, alignItems: 'center'}}>
                           <button type="button" onClick={() => handleEditPeminjaman(item)} disabled={savingPeminjaman || deletingPeminjamanId !== null} style={s.btnAction}>
                             <FaPen size={11} color={C.accent} />
                           </button>
                           <button type="button" onClick={() => handleDeletePeminjaman(item.id)} disabled={savingPeminjaman || deletingPeminjamanId !== null} style={{...s.btnAction, backgroundColor: C.redLight}}>
                             {deletingPeminjamanId === item.id ? <FaSpinner className="spin" size={11} color={C.red} /> : <FaTrash size={11} color={C.red} />}
                           </button>
                        </div>
                      </div>
                    )})}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────
              PROFIL / ABOUT
          ──────────────────────────────────────────────────── */}
          {activeTab === "about" && (
            <div style={s.aboutWrap}>
              <div style={s.aboutCard}>
                <img src={profileImg} alt="Profil" style={s.aboutAvatar} />
                <h2 style={s.aboutName}>Tomy Syarip</h2>
                <p style={s.aboutRole}>Software Dev • PPLG Student</p>
                <div style={s.aboutTags}>
                  <div style={s.tag}><span style={s.tagTxt}>React Web</span></div>
                  <div style={s.tag}><span style={s.tagTxt}>Supabase API</span></div>
                </div>
                <p style={s.aboutDesc}>Aplikasi manajemen peminjaman dan inventaris lab sekolah. Menggunakan performa CRUD yang kokoh dengan UI mobile yang bersih.</p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ─── MOBILE BOTTOM TAB NAVIGATION ─── */}
      <div style={s.bottomBar}>
        {tabs.map(t => (
          <button key={t.key} type="button" onClick={() => setActiveTab(t.key)} style={s.tabItem}>
            <div style={{...s.iconWrapper, color: activeTab === t.key ? C.accent : C.textMuted}}>
              {t.icon}
            </div>
            <span style={{...s.tabLabel, ...(activeTab === t.key ? s.tabLabelActive : {})}}>{t.label}</span>
            {activeTab === t.key && <div style={s.tabIndicator} />}
          </button>
        ))}
      </div>

      {/* ─── MODALS (MOBILE BOTTOM SHEETS) ─── */}
      
      {/* KONDISI MODAL */}
      {kondisiModalVisible && (
        <div style={s.sheetOverlay}>
          <div style={s.sheetBackdrop} onClick={() => setKondisiModalVisible(false)} />
          <div style={s.sheetContent}>
            <div style={s.sheetHead}>
              <span style={s.sheetTitle}>Pilih Kondisi Alat</span>
              <button type="button" onClick={() => setKondisiModalVisible(false)} style={s.iconButton}>
                <FaTimes size={20} color={C.textMuted} />
              </button>
            </div>
            <div style={s.sheetBody}>
              {["Baik", "Perbaikan", "Rusak"].map((item) => (
                <button key={item} type="button" style={s.sheetOption} onClick={() => { updateAlatForm("kondisi", item); setKondisiModalVisible(false); }}>
                  <span style={s.sheetOptionTxt}>{item}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STATUS MODAL */}
      {statusModalVisible && (
        <div style={s.sheetOverlay}>
          <div style={s.sheetBackdrop} onClick={() => setStatusModalVisible(false)} />
          <div style={s.sheetContent}>
            <div style={s.sheetHead}>
              <span style={s.sheetTitle}>Status Peminjaman</span>
              <button type="button" onClick={() => setStatusModalVisible(false)} style={s.iconButton}>
                <FaTimes size={20} color={C.textMuted} />
              </button>
            </div>
            <div style={s.sheetBody}>
              {["Dipinjam", "Dikembalikan", "Terlambat"].map((item) => (
                <button key={item} type="button" style={s.sheetOption} onClick={() => { updatePeminjamanForm("status_pinjam", item); setStatusModalVisible(false); }}>
                  <span style={s.sheetOptionTxt}>{item}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ALAT MODAL */}
      {alatModalVisible && (
        <div style={s.sheetOverlay}>
          <div style={s.sheetBackdrop} onClick={() => setAlatModalVisible(false)} />
          <div style={{...s.sheetContent, height: '70vh'}}>
            <div style={s.sheetHead}>
              <span style={s.sheetTitle}>Pilih Alat Tersedia</span>
              <button type="button" onClick={() => setAlatModalVisible(false)} style={s.iconButton}>
                <FaTimes size={20} color={C.textMuted} />
              </button>
            </div>
            <div style={s.sheetBody}>
              {alat.map(item => (
                <button key={item.id} type="button" style={s.sheetOptionAlat} onClick={() => { updatePeminjamanForm("alat_id", String(item.id)); setAlatModalVisible(false); }}>
                  <span style={s.sheetAlatTitle}>{item.kode_alat} - {item.nama_alat}</span>
                  <span style={s.sheetAlatSub}>Rak: {item.lokasi_rak || "—"} | Sisa Stok: {item.stok_tersedia}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tambahkan sedikit CSS global untuk animasi spinner dan box-sizing jika dibutuhkan */}
      <style>{`
        * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        body { margin: 0; background-color: ${C.bg}; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// =============================================================
// STYLES (Inline CSS Objects for React Web)
// =============================================================

// =============================================================
// STYLES (Inline CSS Objects for React Web - Responsive Desktop)
// =============================================================

const s = {
  safeArea: { 
    display: 'flex', 
    flexDirection: 'column',
    minHeight: '100vh', 
    backgroundColor: C.bg,
    maxWidth: '1200px', // Dibuat 1200px agar luas dan lega di desktop
    width: '100%',
    margin: '0 auto',
    position: 'relative',
    boxShadow: '0 0 20px rgba(0,0,0,0.05)'
  },
  flex: { flex: 1 },
  container: { flex: 1, overflowY: 'auto' },
  content: { padding: '24px', paddingBottom: '120px' }, // Padding diperbesar untuk desktop
  dashLayout: { display: 'flex', flexDirection: 'column', gap: '20px' },
  row: { display: "flex", flexDirection: "row", gap: "16px" },

  // HEADER
  header: {
    backgroundColor: C.surface,
    padding: '24px 32px',
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: `1px solid ${C.border}`,
    position: 'sticky',
    top: 0,
    zIndex: 10
  },
  headerTitle: { margin: 0, fontSize: '24px', fontWeight: "800", color: C.text, letterSpacing: "-0.5px" },
  headerSub: { margin: '4px 0 0 0', fontSize: '13px', color: C.textSecondary },
  headerAvatar: { width: '42px', height: '42px', borderRadius: '12px', backgroundColor: C.bg, objectFit: 'cover' },

  // DASHBOARD GRID (Menggunakan CSS Grid agar otomatis menyesuaikan layar)
  statGrid: { 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", 
    gap: "16px" 
  },
  statCard: {
    backgroundColor: C.surface, 
    padding: "24px", 
    borderRadius: "16px",
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.04)"
  },
  statTitle: { margin: '0 0 8px 0', fontSize: '13px', color: C.textSecondary, fontWeight: "600" },
  statValue: { margin: 0, fontSize: '32px', fontWeight: "800", color: C.text, letterSpacing: "-1px" },

  // PANELS (Cards)
  panel: {
    backgroundColor: C.surface, 
    borderRadius: "16px", 
    overflow: "hidden",
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.04)"
  },
  panelHead: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: `1px solid ${C.border}` },
  panelTitle: { fontSize: "16px", fontWeight: "700", color: C.text },
  panelBadge: { backgroundColor: C.accentLight, color: C.accent, fontWeight: "700", fontSize: "12px", padding: "4px 10px", borderRadius: "12px" },
  panelBody: { padding: "24px" },
  
  // LIST ITEMS
  listItem: { display: "flex", alignItems: "center", padding: "16px 24px", borderBottom: `1px solid ${C.border}` },
  noBorder: { borderBottom: 'none' },
  listMain: { flex: 1, marginLeft: "16px", display: 'flex', flexDirection: 'column' },
  itemTitle: { margin: 0, fontSize: "15px", fontWeight: "600", color: C.text },
  itemSub: { margin: '4px 0 0 0', fontSize: "13px", color: C.textSecondary },
  itemValue: { margin: 0, fontSize: "13px", color: C.textMuted },
  itemFlag: { margin: '4px 0 0 0', fontSize: "12px", fontWeight: "700" },
  itemDate: { margin: '0 0 6px 0', fontSize: "12px", color: C.textMuted },
  avatarCir: { width: "40px", height: "40px", borderRadius: "20px", backgroundColor: C.bg, display: "flex", justifyContent: "center", alignItems: "center" },
  avatarTxt: { fontSize: "15px", fontWeight: "700", color: C.textSecondary },
  emptyState: { padding: "32px", textAlign: "center", color: C.textMuted, fontSize: "14px", margin: 0 },

  // PILLS
  pill: { padding: "6px 10px", borderRadius: "8px", alignSelf: "flex-start" },
  pillText: { fontSize: "12px", fontWeight: "700", textTransform: "capitalize" },

  // FORMS
  inputGroup: { marginBottom: "16px", display: 'flex', flexDirection: 'column' },
  label: { fontSize: "14px", fontWeight: "600", color: C.textSecondary, marginBottom: "8px" },
  input: { 
    backgroundColor: "#F7F9FC", border: "1px solid transparent", outline: 'none',
    borderRadius: "12px", padding: "0 16px", minHeight: "48px", fontSize: "14px", color: C.text,
    width: '100%'
  },
  inputFocus: { borderColor: C.accent, backgroundColor: C.surface },
  textArea: { minHeight: "120px", paddingTop: "16px", resize: 'vertical' },
  select: { display: "flex", alignItems: "center", justifyContent: "space-between", cursor: 'pointer', textAlign: 'left' },
  selectText: { fontSize: "14px", color: C.text },
  placeholderText: { fontSize: "14px", color: C.textMuted },
  formAction: { display: "flex", justifyContent: "flex-end", marginTop: "12px", gap: "12px" },
  iconButton: { background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex' },

  // BUTTONS
  btnPrimary: { backgroundColor: C.accent, padding: "0 28px", minHeight: "44px", borderRadius: "12px", display: "flex", justifyContent: "center", alignItems: "center", border: 'none', cursor: 'pointer', color: "#fff", fontSize: "14px", fontWeight: "700" },
  btnGhost: { padding: "0 20px", minHeight: "44px", display: "flex", justifyContent: "center", alignItems: "center", border: 'none', background: 'transparent', cursor: 'pointer', color: C.textSecondary, fontSize: "14px", fontWeight: "600" },

  // DATA TABLE
  tableScroll: { overflowX: 'auto' },
  tbHead: { display: "flex", borderBottom: `1px solid ${C.borderStrong}`, backgroundColor: "#F8FAFC" },
  tbRow: { display: "flex", borderBottom: `1px solid ${C.border}`, transition: "background 0.2s" },
  tbCell: { padding: "16px", fontSize: "14px", color: C.textSecondary, display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  tbCellHead: { fontSize: "12px", fontWeight: "700", color: C.textMuted },
  fontMono: { fontFamily: 'monospace', fontSize: '13px' },
  btnAction: { backgroundColor: C.accentLight, width: "36px", height: "36px", borderRadius: "8px", marginRight: "8px", display: "flex", justifyContent: "center", alignItems: "center", border: 'none', cursor: 'pointer' },

  // BOTTOM TAB BAR (Diubah ke Fixed agar nempel di bawah viewport browser)
  bottomBar: {
    position: "fixed", 
    bottom: 0, 
    left: "50%", 
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: "1200px", // Mengikuti lebar safeArea
    backgroundColor: C.surface, 
    display: "flex", 
    flexDirection: "row",
    paddingBottom: "16px", 
    paddingTop: "12px",
    borderTop: `1px solid ${C.border}`,
    boxShadow: "0px -2px 10px rgba(0, 0, 0, 0.05)",
    zIndex: 20
  },
  tabItem: { flex: 1, display: "flex", flexDirection: 'column', alignItems: "center", justifyContent: "center", background: 'none', border: 'none', cursor: 'pointer', position: 'relative' },
  iconWrapper: { marginBottom: "6px", height: "24px", display: "flex", justifyContent: "center", alignItems: "center" },
  tabLabel: { fontSize: "12px", color: C.textMuted, fontWeight: "500" },
  tabLabelActive: { color: C.accent, fontWeight: "700" },
  tabIndicator: { width: "6px", height: "6px", borderRadius: "3px", backgroundColor: C.accent, marginTop: "6px", position: "absolute", bottom: "-10px" },

  // BOTTOM SHEETS (Modals)
  sheetOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: 'column', justifyContent: "flex-end", alignItems: "center", zIndex: 100 },
  sheetBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.5)", cursor: 'pointer' },
  sheetContent: { position: 'relative', width: '100%', maxWidth: '600px', backgroundColor: C.surface, borderTopLeftRadius: "24px", borderTopRightRadius: "24px", padding: "24px", paddingBottom: "40px", display: 'flex', flexDirection: 'column', maxHeight: '90vh' },
  sheetHead: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: "20px" },
  sheetTitle: { fontSize: "20px", fontWeight: "700", color: C.text },
  sheetBody: { overflowY: 'auto', display: 'flex', flexDirection: 'column' },
  sheetOption: { padding: "18px 0", borderBottom: `1px solid ${C.border}`, background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' },
  sheetOptionTxt: { fontSize: "16px", color: C.text },
  sheetOptionAlat: { padding: "16px 0", borderBottom: `1px solid ${C.border}`, background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column' },
  sheetAlatTitle: { fontSize: "16px", fontWeight: "600", color: C.text, margin: 0 },
  sheetAlatSub: { fontSize: "13px", color: C.textSecondary, margin: '6px 0 0 0' },

  // ABOUT
  aboutWrap: { display: "flex", flexDirection: 'column', alignItems: "center", marginTop: "40px" },
  aboutCard: { backgroundColor: C.surface, padding: "48px", borderRadius: "24px", display: "flex", flexDirection: 'column', alignItems: "center", width: "100%", maxWidth: "800px", boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.04)" },
  aboutAvatar: { width: "120px", height: "120px", borderRadius: "60px", marginBottom: "20px", objectFit: 'cover' },
  aboutName: { margin: 0, fontSize: "28px", fontWeight: "800", color: C.text },
  aboutRole: { margin: '8px 0 0 0', fontSize: "16px", color: C.textSecondary },
  aboutTags: { display: "flex", flexDirection: "row", gap: "10px", margin: "24px 0" },
  tag: { backgroundColor: C.accentLight, padding: "6px 12px", borderRadius: "8px" },
  tagTxt: { fontSize: "12px", color: C.accent, fontWeight: "700" },
  aboutDesc: { margin: 0, fontSize: "15px", color: C.textSecondary, textAlign: "center", lineHeight: "24px", maxWidth: "600px" },
};