let editingCell = null;

const timeSlots = [
  { start: "08:30", end: "09:45" },
  { start: "09:45", end: "11:00" },
  { start: "11:00", end: "12:15" },
  { start: "12:15", end: "01:30" },
  { start: "01:30", end: "02:45" },
  { start: "02:45", end: "04:00" },
  { start: "04:00", end: "05:15" },
  { start: "05:15", end: "06:30" },
];

const colors = [
  "linear-gradient(135deg,#e0e7ff,#c7d2fe)", // soft indigo
  "linear-gradient(135deg,#d1fae5,#a7f3d0)", // mint green
  "linear-gradient(135deg,#fef3c7,#fde68a)", // soft yellow
  "linear-gradient(135deg,#ffe4e6,#fecdd3)", // soft pink
  "linear-gradient(135deg,#ccfbf1,#99f6e4)", // aqua
  "linear-gradient(135deg,#e0f2fe,#bae6fd)", // sky blue
  "linear-gradient(135deg,#fce7f3,#fbcfe8)", // rose
  "linear-gradient(135deg,#ede9fe,#ddd6fe)", // lavender
];

const subjectColors = {};

function toMin(t) {
  let [h, m] = t.split(":").map(Number);

  // after 12:00 and before 7:00 → PM (add 12 hours)
  if (h < 7) {
    h += 12;
  }

  return h * 60 + m;
}

function isOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

// ✅ SAME SUBJECT = SAME COLOR
function normalizeSubject(text) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function getColor(subject) {
  const key = normalizeSubject(subject);
  if (!subjectColors[key]) {
    subjectColors[key] =
      colors[Object.keys(subjectColors).length % colors.length];
  }
  return subjectColors[key];
}

function addClass() {
  const day = document.getElementById("day").value;
  const start = document.getElementById("start").value;
  const end = document.getElementById("end").value;
  const subject = document.getElementById("subject").value.trim();
  const teacher = document.getElementById("teacher").value.trim();
  const room = document.getElementById("room").value.trim();

  if (!day || !start || !end || !subject || !teacher || !room) {
    alert("সব ইনপুট পূরণ করুন");
    return;
  }

  const classStart = toMin(start);
  const classEnd = toMin(end);

  if (classEnd <= classStart) {
    alert("End time start time এর পরে হতে হবে");
    return;
  }

  const row = document.querySelector(`tr[data-day="${day}"]`);
  const color = getColor(subject);

  // ❌ overlap check
  for (let i = 0; i < timeSlots.length; i++) {
    const s = timeSlots[i];
    if (isOverlap(classStart, classEnd, toMin(s.start), toMin(s.end))) {
      if (row.children[i + 1].innerHTML !== "") {
        alert("এই সময়ের মধ্যে আগেই class আছে");
        return;
      }
    }
  }

  // ✅ insert
  timeSlots.forEach((slot, i) => {
    if (isOverlap(classStart, classEnd, toMin(slot.start), toMin(slot.end))) {
      row.children[i + 1].innerHTML = `
<div class="class-box" style="background:${color}">

    <div class="class-actions">

        <button class="edit-btn" onclick="editClass(this)">
            ✏
        </button>

        <button class="delete-btn" onclick="deleteClass(this)">
            ×
        </button>

    </div>

    <div class="subject">${subject}</div>

    <div class="teacher">${teacher}</div>

    <div class="room">Room: ${room}</div>

    <div class="time">${start} - ${end}</div>

</div>
`;
    }
  });

  // reset
  document.getElementById("start").value = "";
  document.getElementById("end").value = "";
  document.getElementById("subject").value = "";
  document.getElementById("teacher").value = "";
  document.getElementById("room").value = "";
}

// download part

function downloadRoutine() {
  const btn = document.querySelector(".download-btn");

  btn.style.display = "none";

  document.querySelectorAll(".edit-btn, .delete-btn").forEach((b) => {
    b.style.display = "none";
  });

  const table = document.querySelector(".routine");
  const title = document.getElementById("scheduleTitle");
  const section = document.getElementById("scheduleSection");

  // Export Container
  const exportDiv = document.createElement("div");

  exportDiv.style.background = "#ffffff";
  exportDiv.style.padding = "40px";
  exportDiv.style.display = "inline-block";
  exportDiv.style.textAlign = "center";

  // ===== Title =====
  const titleClone = title.cloneNode(true);
  titleClone.style.margin = "0";
  titleClone.style.marginBottom = "10px";
  titleClone.style.fontSize = "30px";
  titleClone.style.fontWeight = "700";
  titleClone.style.color = "#4b2aad";

  exportDiv.appendChild(titleClone);

  // ===== Section =====
  if (section.innerText.trim() !== "") {
    const sectionClone = section.cloneNode(true);
    sectionClone.style.margin = "0";
    sectionClone.style.marginBottom = "25px";
    sectionClone.style.fontSize = "20px";
    sectionClone.style.fontWeight = "600";
    sectionClone.style.color = "#555";

    exportDiv.appendChild(sectionClone);
  }

  // ===== Table =====
  exportDiv.appendChild(table.cloneNode(true));

  // DOM এ অস্থায়ীভাবে যোগ করো
  exportDiv.style.position = "fixed";
  exportDiv.style.left = "-99999px";
  document.body.appendChild(exportDiv);

  domtoimage
    .toPng(exportDiv, {
      quality: 1,
      bgcolor: "#ffffff",
      width: exportDiv.scrollWidth,
      height: exportDiv.scrollHeight,
    })
    .then((dataUrl) => {
      const link = document.createElement("a");
      link.download = "Class_Routine.png";
      link.href = dataUrl;
      link.click();

      document.body.removeChild(exportDiv);

      btn.style.display = "block";

      document.querySelectorAll(".edit-btn, .delete-btn").forEach((b) => {
        b.style.display = "flex";
      });
    })
    .catch((err) => {
      console.error(err);

      document.body.removeChild(exportDiv);

      btn.style.display = "block";

      document.querySelectorAll(".edit-btn, .delete-btn").forEach((b) => {
        b.style.display = "flex";
      });
    });
}
// class edit part

function editClass(btn) {
  editingCell = btn.closest("td");

  const row = editingCell.parentElement;

  document.getElementById("editDay").value = row.dataset.day;

  document.getElementById("editSubject").value =
    editingCell.querySelector(".subject").innerText;

  document.getElementById("editTeacher").value =
    editingCell.querySelector(".teacher").innerText;

  document.getElementById("editRoom").value = editingCell
    .querySelector(".room")
    .innerText.replace("Room: ", "");

  const time = editingCell.querySelector(".time").innerText.split(" - ");

  document.getElementById("editStart").value = time[0];
  document.getElementById("editEnd").value = time[1];

  document.getElementById("editModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("editModal").style.display = "none";

  editingCell = null;
}

function deleteClass(btn) {
  if (confirm("Delete this class?")) {
    btn.closest("td").innerHTML = "";
  }
}

// uodate class part

function updateClass() {
  if (!editingCell) return;

  const subject = document.getElementById("editSubject").value.trim();
  const teacher = document.getElementById("editTeacher").value.trim();
  const room = document.getElementById("editRoom").value.trim();
  const start = document.getElementById("editStart").value;
  const end = document.getElementById("editEnd").value;

  // Validation
  if (!subject || !teacher || !room || !start || !end) {
    alert("সব তথ্য পূরণ করুন");
    return;
  }

  // Time validation
  const classStart = toMin(start);
  const classEnd = toMin(end);

  if (classEnd <= classStart) {
    alert("End time start time এর পরে হতে হবে");
    return;
  }

  const color = getColor(subject);

  editingCell.innerHTML = `
<div class="class-box" style="background:${color}">
    <div class="class-actions">
        <button class="edit-btn" onclick="editClass(this)">✏</button>
        <button class="delete-btn" onclick="deleteClass(this)">×</button>
    </div>

    <div class="subject">${subject}</div>
    <div class="teacher">${teacher}</div>
    <div class="room">Room: ${room}</div>
    <div class="time">${start} - ${end}</div>
</div>
`;

  closeModal();
}

function updateTitle() {
  const section = document.getElementById("section").value.trim();

  const title = document.getElementById("scheduleTitle");
  const sectionText = document.getElementById("scheduleSection");

  if (section === "") {
    title.innerText = "SUB CSE (63) Class Schedule";
    sectionText.innerText = "";
  } else {
    title.innerText = `SUB CSE (63 - ${section}) Class Schedule`;
    sectionText.innerText = `Section: ${section}`;
  }
}
