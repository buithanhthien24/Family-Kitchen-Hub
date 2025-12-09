import React, { useEffect, useState } from "react";
import axios from "../../hooks/axios";
import EditProfile from "../EditProfile";
import "./../../styles/FamilyProfile.css";
import { Pen, Trash2, PlusCircle, Users, Heart, Activity, Target, UserCircle } from "lucide-react";

export default function FamilyProfiles() {
  const [members, setMembers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    age: "",
    role: "",
    healthGoals: "",
    notes: "",
  });

  // Fetch API thật khi load trang
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("Chưa có token, vui lòng đăng nhập!");
      return;
    }

    axios
      .get("/family-members", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setMembers(res.data);
      })
      .catch((err) => {
        console.error("Lỗi khi lấy danh sách:", err.response || err.message || err);
      });
  }, []);

  // Form handler
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function handleAdd(e) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("Chưa đăng nhập!");
    const user = JSON.parse(localStorage.getItem("user"));

    const payload = {
      userId: user?.id,
      name: form.name,
      age: parseInt(form.age) || null,
      role: form.role || null,
      healthGoals: form.healthGoals,
      notes: form.notes,
      allergies: [],
    };

    axios
      .post("/family-members", payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setMembers((prev) => [...prev, res.data]);
        closeModal();
      })
      .catch((err) => {
        console.error("Lỗi khi thêm thành viên:", err);
        alert("Không thể thêm thành viên!");
      });
  }

  function handleEditSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("Chưa đăng nhập!");

    const payload = {
      name: form.name,
      age: parseInt(form.age) || null,
      role: form.role || null,
      healthGoals: form.healthGoals,
      notes: form.notes,
    };

    axios
      .put(`/family-members/${editing.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setMembers((prev) =>
          prev.map((m) => (m.id === editing.id ? res.data : m))
        );
        closeModal();
      })
      .catch((err) => {
        console.error("Lỗi khi cập nhật:", err);
        alert("Không thể cập nhật thành viên!");
      });
  }

  function handleDelete(id) {
    const token = localStorage.getItem("token");
    if (!token) return alert("Chưa đăng nhập!");

    if (!window.confirm("Xóa thành viên này?")) return;
    axios
      .delete(`/family-members/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => setMembers((prev) => prev.filter((m) => m.id !== id)))
      .catch((err) => {
        console.error("Lỗi khi xóa:", err);
        alert("Không thể xóa!");
      });
  }

  function openModal(member = null) {
    if (member) {
      setEditing(member);
      setForm({
        name: member.name,
        age: member.age || "",
        role: member.role || "",
        healthGoals: member.healthGoals || "",
        notes: member.notes || "",
      });
    } else {
      setEditing(null);
      setForm({ name: "", age: "", role: "", healthGoals: "", notes: "" });
    }
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
    setEditing(null);
  }

  // Calculate stats
  const totalMembers = members.length;
  const avgAge = members.length > 0
    ? Math.round(members.reduce((sum, m) => sum + (m.age || 0), 0) / members.length)
    : 0;
  const withGoals = members.filter(m => m.healthGoals).length;

  return (
    <div className="family-profiles-wrap">


      {/* Two Column Layout */}
      <div className="family-profile-layout">
        {/* LEFT: Edit Profile */}
        <div className="left-section">
          <EditProfile />
        </div>

        {/* RIGHT: Family Members */}
        <div className="right-section">
          <div className="members-header">
            <div className="header-content">
              <h2>
                <Users size={24} className="header-icon" />
                Family Members
              </h2>
              <p className="muted">Quản lý thông tin gia đình</p>
            </div>
            <button className="btn primary" onClick={() => openModal()}>
              <PlusCircle size={16} /> Add Member
            </button>
          </div>

          <div className="members-list">
            {members.length === 0 ? (
              <div className="empty-state">
                <Users size={48} />
                <h3>Chưa có thành viên nào</h3>
                <p>Thêm thành viên gia đình để bắt đầu</p>
                <button className="btn primary" onClick={() => openModal()}>
                  <PlusCircle size={16} /> Thêm thành viên đầu tiên
                </button>
              </div>
            ) : (
              members.map((m) => (
                <div key={m.id} className="member-card">
                  <div className="card-top">
                    <div className="avatar">
                      {m.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div className="meta">
                      <h4>{m.name}</h4>
                      <p className="sub">
                        {m.role && (
                          <span className="role-badge">
                            <UserCircle size={12} />
                            {m.role}
                          </span>
                        )}
                        {m.age && (
                          <span className="age-badge">
                            {m.age} tuổi
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="actions">
                      <button
                        onClick={() => openModal(m)}
                        className="icon-btn edit"
                        title="Edit"
                      >
                        <Pen size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="icon-btn delete"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="card-body">
                    {m.healthGoals && (
                      <div className="info-row">
                        <div className="info-icon">
                          <Target size={14} />
                        </div>
                        <div className="info-text">
                          <strong>Mục tiêu:</strong> {m.healthGoals}
                        </div>
                      </div>
                    )}
                    {m.notes && (
                      <div className="info-row">
                        <div className="info-icon">
                          <Heart size={14} />
                        </div>
                        <div className="info-text">
                          <strong>Ghi chú:</strong> {m.notes}
                        </div>
                      </div>
                    )}
                    {!m.healthGoals && !m.notes && (
                      <p className="no-info">Chưa có thông tin bổ sung</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal for Add/Edit Member */}
      {isOpen && (
        <div className={`modal-overlay ${isOpen ? "active" : ""}`}>
          <div className="modal">
            <div className="modal-header">
              <h3>
                {editing ? "✏️ Chỉnh sửa thành viên" : "➕ Thêm thành viên mới"}
              </h3>
              <button className="icon-btn close-btn" onClick={closeModal}>
                ✕
              </button>
            </div>

            <form
              className="modal-form"
              onSubmit={editing ? handleEditSubmit : handleAdd}
            >
              <label>
                Tên thành viên
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  required
                />
              </label>

              <div className="form-grid">
                <label>
                  Tuổi
                  <input
                    type="number"
                    name="age"
                    value={form.age}
                    onChange={handleChange}
                    placeholder="25"
                  />
                </label>
                <label>
                  Vai trò
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                  >
                    <option value="">-- Chọn vai trò --</option>
                    <option value="Dad">👨 Bố</option>
                    <option value="Mom">👩 Mẹ</option>
                    <option value="Son">👦 Con trai</option>
                    <option value="Daughter">👧 Con gái</option>
                    <option value="Grandparent">👴 Ông/Bà</option>
                    <option value="Other">👤 Khác</option>
                  </select>
                </label>
              </div>

              <label>
                Mục tiêu sức khỏe
                <input
                  type="text"
                  name="healthGoals"
                  value={form.healthGoals}
                  onChange={handleChange}
                  placeholder="Giảm cân, tăng cơ..."
                />
              </label>

              <label>
                Ghi chú (Dị ứng, sở thích...)
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Ví dụ: Dị ứng hải sản, thích ăn chay..."
                />
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn ghost"
                  onClick={closeModal}
                >
                  Hủy
                </button>
                <button type="submit" className="btn primary">
                  {editing ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
