import React, { useEffect, useState } from "react";
import "./../../styles/FamilyProfile.css";
import { Pen, Trash2, PlusCircle } from "lucide-react"; // or any icons you prefer

const SAMPLE = [
  {
    id: 1,
    name: "John Smith",
    age: 35,
    gender: "male",
    activity: "moderate",
    weightKg: 75,
    heightCm: 178,
    allergies: ["Nuts", "Shellfish"],
    dietary: [],
    goals: ["Weight Loss", "Heart Health"],
    status: "active",
  },
  {
    id: 2,
    name: "Sarah Smith",
    age: 32,
    gender: "female",
    activity: "active",
    weightKg: 62,
    heightCm: 165,
    allergies: ["Dairy"],
    dietary: ["Dairy-Free"],
    goals: ["Better Digestion", "Increased Energy"],
    status: "active",
  },
  {
    id: 3,
    name: "Emily Smith",
    age: 8,
    gender: "female",
    activity: "active",
    weightKg: 28,
    heightCm: 130,
    allergies: ["Peanuts"],
    dietary: [],
    goals: ["Healthy Growth"],
    status: "active",
  },
  {
    id: 4,
    name: "Michael Smith",
    age: 65,
    gender: "male",
    activity: "light",
    weightKg: 80,
    heightCm: 175,
    allergies: [],
    dietary: [],
    goals: ["Lower Cholesterol", "Heart Health", "Diabetes Management"],
    status: "light",
  },
];

function calcBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm) return null;
  const h = heightCm / 100;
  const bmi = weightKg / (h * h);
  return Math.round(bmi * 10) / 10;
}

function bmiCategory(bmi) {
  if (bmi == null) return "";
  if (bmi < 18.5) return { label: "Underweight", color: "blue" };
  if (bmi < 25) return { label: "Normal", color: "green" };
  if (bmi < 30) return { label: "Overweight", color: "orange" };
  return { label: "Obesity", color: "red" };
}

export default function FamilyProfiles() {
  const [members, setMembers] = useState(() => {
    const raw = localStorage.getItem("familyProfiles");
    return raw ? JSON.parse(raw) : [];
  });
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null | member object
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "male",
    activity: "",
    weightKg: "",
    heightCm: "",
    allergies: "",
    dietary: "",
    goals: "",
    status: "active",
  });

  useEffect(() => {
    localStorage.setItem("familyProfiles", JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    // if editing changes, populate form
    if (editing) {
      setForm({
        name: editing.name || "",
        age: editing.age || "",
        gender: editing.gender || "male",
        activity: editing.activity || "",
        weightKg: editing.weightKg || "",
        heightCm: editing.heightCm || "",
        allergies: (editing.allergies || []).join(", "),
        dietary: (editing.dietary || []).join(", "),
        goals: (editing.goals || []).join(", "),
        status: editing.status || "active",
      });
      setIsOpen(true);
    }
  }, [editing]);

  function resetForm() {
    setForm({
      name: "",
      age: "",
      gender: "male",
      activity: "",
      weightKg: "",
      heightCm: "",
      allergies: "",
      dietary: "",
      goals: "",
      status: "active",
    });
  }

  function openAdd() {
    setEditing(null);
    resetForm();
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
    setEditing(null);
    resetForm();
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function parseTags(raw) {
    if (!raw) return [];
    return raw
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length);
  }

  function handleSave(e) {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      age: Number(form.age) || null,
      gender: form.gender,
      activity: form.activity,
      weightKg: form.weightKg ? Number(form.weightKg) : null,
      heightCm: form.heightCm ? Number(form.heightCm) : null,
      allergies: parseTags(form.allergies),
      dietary: parseTags(form.dietary),
      goals: parseTags(form.goals),
      status: form.status,
    };

    if (!payload.name) {
      alert("Please enter a name.");
      return;
    }

    if (editing) {
      setMembers((prev) =>
        prev.map((m) => (m.id === editing.id ? { ...m, ...payload } : m))
      );
    } else {
      const newMember = {
        id: Date.now(),
        ...payload,
      };
      setMembers((prev) => [newMember, ...prev]);
    }
    closeModal();
  }

  function handleEdit(member) {
    setEditing(member);
  }

  function handleDelete(id) {
    if (!window.confirm("Delete this family member?")) return;
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  function loadSample() {
    // make copies with unique ids
    const withIds = SAMPLE.map((s) => ({ ...s, id: Date.now() + Math.random() * 10000 }));
    setMembers(withIds);
  }

  function clearAll() {
    if (!window.confirm("Clear all family members?")) return;
    setMembers([]);
  }

  return (
    <div className="family-profiles-wrap">
      <div className="profiles-header">
        <div>
          <h1>Family Profiles</h1>
          <p className="muted">Manage family members' health preferences and dietary needs</p>
        </div>
        <div className="header-actions">
          <button className="btn ghost" onClick={loadSample}>Load Sample Data</button>
          <button className="btn danger" onClick={clearAll}>Clear All</button>
          <button className="btn primary" onClick={openAdd}>
            <PlusCircle size={16} /> <span>Add Family Member</span>
          </button>
        </div>
      </div>

      <div className="cards-grid">
        {members.length === 0 && (
          <div className="empty">No members yet — click “Add Family Member” or load sample data.</div>
        )}

        {members.map((m) => {
          const bmi = calcBMI(m.weightKg, m.heightCm);
          const cat = bmiCategory(bmi);
          return (
            <div key={m.id} className="profile-card">
              <div className="card-top">
                <div className="avatar">{m.name.split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase()}</div>
                <div className="meta">
                  <div className="name-row">
                    <h3>{m.name}</h3>
                    <div className="actions">
                      <button onClick={() => handleEdit(m)} className="icon-btn"><Pen size={14} /></button>
                      <button onClick={() => handleDelete(m.id)} className="icon-btn delete"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div className="sub">{m.age || "--"} years • {m.gender} • {m.activity || "—"}</div>
                </div>
              </div>

              <div className="card-body">
                <div className="row">
                  <div className="bmi">
                    <span className="muted">BMI:</span>{" "}
                    {bmi ? (
                      <><strong>{bmi}</strong> <span className={`bmi-tag ${cat.color}`}>({cat.label})</span></>
                    ) : <span className="muted">—</span>}
                  </div>

                  <div className="vitals">
                    <span className="muted">♥</span> {m.weightKg ? `${m.weightKg}kg` : "--"} • {m.heightCm ? `${m.heightCm}cm` : "--"}
                  </div>
                </div>

                {m.allergies?.length > 0 && (
                  <div className="section">
                    <div className="section-title">Allergies</div>
                    <div className="chips">
                      {m.allergies.map((a, idx) => <span key={idx} className="chip danger">{a}</span>)}
                    </div>
                  </div>
                )}

                {m.dietary?.length > 0 && (
                  <div className="section">
                    <div className="section-title">Dietary Preferences</div>
                    <div className="chips">{m.dietary.map((d, idx) => <span key={idx} className="chip">{d}</span>)}</div>
                  </div>
                )}

                {m.goals?.length > 0 && (
                  <div className="section">
                    <div className="section-title">Health Goals</div>
                    <div className="chips">{m.goals.map((g, idx) => <span key={idx} className="chip outline">{g}</span>)}</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="modal-overlay" onMouseDown={closeModal}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? "Edit Family Member" : "Add Family Member"}</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <form className="modal-form" onSubmit={handleSave}>
              <div className="form-grid">
                <label>
                  Name
                  <input name="name" value={form.name} onChange={handleChange} />
                </label>
                <label>
                  Age
                  <input name="age" type="number" value={form.age} onChange={handleChange} />
                </label>
              </div>

              <div className="form-grid">
                <label>
                  Gender
                  <select name="gender" value={form.gender} onChange={handleChange}>
                    <option value="male">male</option>
                    <option value="female">female</option>
                    <option value="other">other</option>
                  </select>
                </label>

                <label>
                  Activity
                  <input name="activity" value={form.activity} onChange={handleChange} placeholder="e.g. moderate, active, light" />
                </label>
              </div>

              <div className="form-grid">
                <label>
                  Weight (kg)
                  <input name="weightKg" type="number" value={form.weightKg} onChange={handleChange} />
                </label>
                <label>
                  Height (cm)
                  <input name="heightCm" type="number" value={form.heightCm} onChange={handleChange} />
                </label>
              </div>

              <label>
                Allergies (comma separated)
                <input name="allergies" value={form.allergies} onChange={handleChange} placeholder="Peanuts, Shellfish" />
              </label>

              <label>
                Dietary preferences (comma separated)
                <input name="dietary" value={form.dietary} onChange={handleChange} placeholder="Dairy-Free, Vegetarian" />
              </label>

              <label>
                Health goals (comma separated)
                <input name="goals" value={form.goals} onChange={handleChange} placeholder="Weight Loss, Better Digestion" />
              </label>

              <label>
                Status
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="active">active</option>
                  <option value="light">light</option>
                  <option value="inactive">inactive</option>
                </select>
              </label>

              <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                <button type="button" className="btn ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn primary">{editing ? "Save changes" : "Add member"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
