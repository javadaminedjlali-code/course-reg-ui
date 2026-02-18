// Simple demo "database" using localStorage (no backend needed)
const LS_KEY = "courseRegDemo_v1";

function seedIfEmpty(){
  if(localStorage.getItem(LS_KEY)) return;

  const data = {
    users: {
      students: [
        { id:"s1001", name:"Alex Student", password:"pass123" },
        { id:"s1002", name:"Taylor Student", password:"pass123" },
      ],
      instructors: [
        { id:"i2001", name:"Dr. Rivera", password:"teach123" },
        { id:"i2002", name:"Prof. Kim", password:"teach123" },
      ]
    },
    courses: [
      { dept:"INFO", num:"320", title:"Spreadsheet Modeling", credits:3, prereq:"None", modality:"In-Person" },
      { dept:"INFO", num:"465", title:"Systems Analysis", credits:3, prereq:"INFO 300", modality:"Hybrid" },
      { dept:"MATH", num:"151", title:"Precalculus", credits:3, prereq:"Placement", modality:"In-Person" },
      { dept:"ECON", num:"201", title:"Principles of Micro", credits:3, prereq:"None", modality:"Online" },
    ],
    sessions: [
      { sessionId:"INFO320-001", dept:"INFO", num:"320", instructorId:"i2001", time:"Mon/Wed 10:00", max:2 },
      { sessionId:"INFO465-001", dept:"INFO", num:"465", instructorId:"i2002", time:"Tue/Thu 14:00", max:3 },
      { sessionId:"MATH151-002", dept:"MATH", num:"151", instructorId:"i2001", time:"Mon/Wed 12:00", max:2 },
      { sessionId:"ECON201-OL1", dept:"ECON", num:"201", instructorId:"i2002", time:"Asynchronous", max:5 },
    ],
    enrollments: {
      // sessionId: [studentIds]
      "INFO320-001": ["s1001"],
      "INFO465-001": [],
      "MATH151-002": ["s1002"],
      "ECON201-OL1": []
    },
    auth: { role:null, userId:null } // role: "student" | "instructor" | "admin"
  };

  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

function loadData(){
  seedIfEmpty();
  return JSON.parse(localStorage.getItem(LS_KEY));
}
function saveData(data){
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

function setAuth(role, userId){
  const data = loadData();
  data.auth = { role, userId };
  saveData(data);
}
function clearAuth(){
  const data = loadData();
  data.auth = { role:null, userId:null };
  saveData(data);
}
function getAuth(){
  const data = loadData();
  return data.auth;
}

function findCourse(courses, dept, num){
  return courses.find(c => c.dept===dept && c.num===num);
}

function getSessionDetails(data, s){
  const course = findCourse(data.courses, s.dept, s.num);
  const instructor = data.users.instructors.find(i => i.id===s.instructorId);
  const enrolled = (data.enrollments[s.sessionId] || []).length;
  return { ...s, course, instructor, enrolled };
}

function qs(id){ return document.getElementById(id); }
function setMsg(el, type, text){
  el.className = "msg " + (type || "");
  el.textContent = text;
  el.hidden = !text;
}

// Authorization helper: session enrollment page is restricted
function requireRole(allowedRoles){
  const { role } = getAuth();
  return allowedRoles.includes(role);
}

// Enrollment validation rules:
// 1) Cannot enroll if session full
// 2) Cannot enroll if already enrolled in that session
function enrollStudent(sessionId, studentId){
  const data = loadData();
  const session = data.sessions.find(s => s.sessionId===sessionId);
  if(!session) return { ok:false, msg:"Session not found." };

  const list = data.enrollments[sessionId] || [];
  if(list.includes(studentId)) return { ok:false, msg:"Duplicate blocked: you are already registered for this session." };
  if(list.length >= session.max) return { ok:false, msg:"Enrollment limit reached: this session is full." };

  list.push(studentId);
  data.enrollments[sessionId] = list;
  saveData(data);
  return { ok:true, msg:"Registered successfully." };
}

function dropStudent(sessionId, studentId){
  const data = loadData();
  const list = data.enrollments[sessionId] || [];
  data.enrollments[sessionId] = list.filter(id => id !== studentId);
  saveData(data);
  return { ok:true, msg:"Dropped successfully." };
}
