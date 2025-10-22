import mongoose from "mongoose";
const { Schema } = mongoose;

const AdminSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: Number, required: true },
  email: { type: String, required: true }
});

const SubjectSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  credits: { type: Number, required: true }
});

const AttendanceRecordSchema = new Schema({
  date: { type: Date, required: true },
  present: { type: Boolean, required: true }
});

const SubjectAttendanceSchema = new Schema({
  subject: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
  attendanceRecords: [AttendanceRecordSchema]
});

const SemesterAttendanceSchema = new Schema({
  semesterNumber: { type: Number, required: true },
  subjects: [SubjectAttendanceSchema]
});

const StudentSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: Number, required: true },
  email: { type: String, required: true },
  branch: { type: String, required: true },
  section: { type: String, required: true },
  batchStart: { type: Number, required: true },
  batchEnd: { type: Number, required: true },
  creditsObtained: { type: Number, default: 0 },
  semesters: [SemesterAttendanceSchema]  
});

const ClassSchema = new Schema({
  id: { type: String, required: true, unique: true },
  branch: { type: String, required: true },
  batchStart: { type: Number, required: true },
  batchEnd: { type: Number, required: true },
  section: { type: String, required: true },
  students: [{ type: Schema.Types.ObjectId, ref: "Student" }]
});

const TimetableEntrySchema = new Schema({
  id: { type: String, required: true, unique: true },
  dayOfWeek: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
  subjectCode: { type: String, ref: "Subject", required: true },
  classroom: { type: String }
});

const TeacherSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: Number, required: true },
  officialEmail: { type: String, required: true },
  subjects: [{ type: Schema.Types.ObjectId, ref: "Subject" }],
  timetable: [TimetableEntrySchema]
});

const Admin = mongoose.model("Admin", AdminSchema);
const Subject = mongoose.model("Subject", SubjectSchema);
const Student = mongoose.model("Student", StudentSchema);
const ClassModel = mongoose.model("Class", ClassSchema);
const Teacher = mongoose.model("Teacher", TeacherSchema);

export { Admin, Subject, Student, ClassModel, Teacher };