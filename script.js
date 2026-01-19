const timeSlots = [
 { start: "08:30", end: "09:45" },
 { start: "09:45", end: "11:00" },
 { start: "11:00", end: "12:15" },
 { start: "12:15", end: "13:30" },
 { start: "13:30", end: "14:45" },
 { start: "14:45", end: "16:00" },
 { start: "16:00", end: "17:15" },
 { start: "17:15", end: "18:30" }
];

const colors = [
 "linear-gradient(135deg,#e0e7ff,#c7d2fe)",  // soft indigo
 "linear-gradient(135deg,#d1fae5,#a7f3d0)",  // mint green
 "linear-gradient(135deg,#fef3c7,#fde68a)",  // soft yellow
 "linear-gradient(135deg,#ffe4e6,#fecdd3)",  // soft pink
 "linear-gradient(135deg,#ccfbf1,#99f6e4)",  // aqua
 "linear-gradient(135deg,#e0f2fe,#bae6fd)",  // sky blue
 "linear-gradient(135deg,#fce7f3,#fbcfe8)",  // rose
 "linear-gradient(135deg,#ede9fe,#ddd6fe)"   // lavender
];

const subjectColors = {};

function toMin(t){
 const [h,m] = t.split(":").map(Number);
 return h*60 + m;
}

function isOverlap(aStart,aEnd,bStart,bEnd){
 return aStart < bEnd && aEnd > bStart;
}

// ✅ SAME SUBJECT = SAME COLOR
function normalizeSubject(text){
 return text
  .toLowerCase()
  .replace(/\s+/g," ")
  .trim();
}

function getColor(subject){
 const key = normalizeSubject(subject);
 if(!subjectColors[key]){
  subjectColors[key] =
   colors[Object.keys(subjectColors).length % colors.length];
 }
 return subjectColors[key];
}

function addClass(){

 const day     = document.getElementById("day").value;
 const start   = document.getElementById("start").value;
 const end     = document.getElementById("end").value;
 const subject = document.getElementById("subject").value.trim();
 const teacher = document.getElementById("teacher").value.trim();
 const room    = document.getElementById("room").value.trim();

 if(!day || !start || !end || !subject || !teacher || !room){
  alert("সব ইনপুট পূরণ করুন");
  return;
 }

 const classStart = toMin(start);
 const classEnd   = toMin(end);

 if(classEnd <= classStart){
  alert("End time start time এর পরে হতে হবে");
  return;
 }

 const row = document.querySelector(`tr[data-day="${day}"]`);
 const color = getColor(subject);

 // ❌ overlap check
 for(let i=0;i<timeSlots.length;i++){
  const s=timeSlots[i];
  if(isOverlap(classStart,classEnd,toMin(s.start),toMin(s.end))){
   if(row.children[i+1].innerHTML!==""){
    alert("এই সময়ের মধ্যে আগেই class আছে");
    return;
   }
  }
 }

 // ✅ insert
 timeSlots.forEach((slot,i)=>{
  if(isOverlap(classStart,classEnd,toMin(slot.start),toMin(slot.end))){
   row.children[i+1].innerHTML=`
    <div class="class-box" style="background:${color}">
     <button class="delete-btn" onclick="deleteClass(this)">×</button>
     <div class="subject">${subject}</div>
     <div class="teacher">${teacher}</div>
     <div class="room">Room: ${room}</div>
     <div class="time">${start} - ${end}</div>
    </div>
   `;
  }
 });

 // reset
 document.getElementById("start").value="";
 document.getElementById("end").value="";
 document.getElementById("subject").value="";
 document.getElementById("teacher").value="";
 document.getElementById("room").value="";
}


function downloadRoutine(){
 const area=document.getElementById("routineArea");
 document.querySelectorAll(".delete-btn")
  .forEach(b=>b.style.display="none");

 html2canvas(area,{scale:3,backgroundColor:"#fff"})
 .then(c=>{
  const a=document.createElement("a");
  a.download="Class_Routine.png";
  a.href=c.toDataURL();
  a.click();
  document.querySelectorAll(".delete-btn")
   .forEach(b=>b.style.display="block");
 });
}
