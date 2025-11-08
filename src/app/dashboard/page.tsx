"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User as FirebaseUser, signOut, getAuth } from "firebase/auth";
import {
  Calendar,
  Clock,
  BookOpen,
  User,
  Phone,
  Mail,
  MapPin,
  LogOut
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

// ================= INTERFACES =================

interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
}

interface TimetableEntry {
  id: string;
  dayOfWeek: string[];
  startTime: string;
  endTime: string;
  classId: string;
  subjectCode: string;
  classroom?: string;
}

interface Teacher {
  id: string;
  name: string;
  phone: number;
  officialEmail: string;
  subjects: Subject[];
  timetable: TimetableEntry[];
}

interface ClassDetails {
  id: string;
  branch: string;
  batchStart: number;
  batchEnd: number;
  section: string;
}

// Add a derived type for "Today's Classes"
interface TodayClass extends TimetableEntry {
  subject?: Subject;
  classDetails?: ClassDetails;
}

// ================= MOCK DATA =================

const mockTeacherData: Teacher = {
  id: "T001",
  name: "Dr. Sonakshi Vij",
  phone: 9876543210,
  officialEmail: "teacher@example.com",
  subjects: [
    { id: "S001", name: "Data Mining", code: "AIDS355", credits: 4 },
    { id: "S002", name: "Data Mining Lab", code: "AIDS305", credits: 2 },
  ],
  timetable: [
    {
      id: "TT001",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday"],
      startTime: "12:20",
      endTime: "1:10",
      classId: "C001",
      subjectCode: "AIDS355",
      classroom: "Room 508",
    },
    {
      id: "TT002",
      dayOfWeek: ["Thursday"],
      startTime: "12:20",
      endTime: "1:10",
      classId: "C001",
      subjectCode: "AIDS355",
      classroom: "Room 412",
    },
    {
      id: "TT003",
      dayOfWeek: ["Tuesday"],
      startTime: "11:30",
      endTime: "12:20",
      classId: "C002",
      subjectCode: "AIDS355",
      classroom: "Room 504",
    },
    {
      id: "TT003",
      dayOfWeek: ["Wednesday"],
      startTime: "2:50",
      endTime: "3:40",
      classId: "C002",
      subjectCode: "AIDS355",
      classroom: "Room 508",
    },
    {
      id: "TT003",
      dayOfWeek: ["Thursday", "Friday"],
      startTime: "2:00",
      endTime: "2:50",
      classId: "C002",
      subjectCode: "AIDS355",
      classroom: "Room 507",
    },
    {
      id: "TT004",
      dayOfWeek: ["Thursday"],
      startTime: "2:00",
      endTime: "2:50",
      classId: "C002",
      subjectCode: "AIDS355",
      classroom: "Room 508",
    },
    {
      id: "TT005",
      dayOfWeek: ["Wednesday"],
      startTime: "3:40",
      endTime: "5:20",
      classId: "C001",
      subjectCode: "AIDS305",
      classroom: "Room 408",
    },
    {
      id: "TT006",
      dayOfWeek: ["Friday"],
      startTime: "9:00",
      endTime: "10:40",
      classId: "C001",
      subjectCode: "AIDS305",
      classroom: "Room 408",
    },
    {
      id: "TT006",
      dayOfWeek: ["Monday"],
      startTime: "10:40",
      endTime: "12:20",
      classId: "C002",
      subjectCode: "AIDS305",
      classroom: "Room 408",
    },
    {
      id: "TT007",
      dayOfWeek: ["Friday"],
      startTime: "12:20",
      endTime: "2:00",
      classId: "C002",
      subjectCode: "AIDS305",
      classroom: "Room 408",
    },
  ],
};

const mockClassDetails: Record<string, ClassDetails> = {
  C001: {
    id: "C001",
    branch: "AIDS",
    batchStart: 2023,
    batchEnd: 2027,
    section: "A",
  },
  C002: {
    id: "C002",
    branch: "AIDS",
    batchStart: 2023,
    batchEnd: 2027,
    section: "B",
  },
};

// Calculate total weekly hours
// helper: parse "h:mm" or "hh:mm" or with optional AM/PM -> minutes since 00:00 (0..1439)
function parseTimeToMinutes(time: string): number {
  const t = time.trim();
  const ampmMatch = t.match(/(am|pm)$/i);
  let base = t;
  let isPM: boolean | null = null;

  if (ampmMatch) {
    isPM = ampmMatch[0].toLowerCase() === "pm";
    base = t.replace(/(am|pm)$/i, "").trim();
  }

  const [hStr, mStr] = base.split(":");
  let h = Number(hStr);
  const m = Number(mStr || 0);

  // Normalize hour if AM/PM present
  if (isPM !== null) {
    if (isPM && h !== 12) h += 12;
    if (!isPM && h === 12) h = 0;
  }

  return h * 60 + m;
}

// compute total weekly minutes from a timetable array
function computeTotalWeeklyMinutes(timetable: TimetableEntry[]) {
  return timetable.reduce((total, entry) => {
    const startMinutes = parseTimeToMinutes(entry.startTime);
    let endMinutes = parseTimeToMinutes(entry.endTime);

    // If end is earlier or equal, assume it's in the next 12-hour block (e.g. 12:20 -> 1:10 means 13:10)
    if (endMinutes <= startMinutes) {
      endMinutes += 12 * 60;
    }

    const durationMinutes = endMinutes - startMinutes;
    // guard: prevent negative or weird durations
    const safeDuration = Math.max(0, durationMinutes);

    return total + safeDuration * entry.dayOfWeek.length;
  }, 0);
}

// format minutes to "H h M m" and decimal hours
function formatMinutes(minutesTotal: number) {
  const hours = Math.floor(minutesTotal / 60);
  const minutes = Math.round(minutesTotal % 60);
  const decimalHours = minutesTotal / 60;
  return { text: `${hours}h ${minutes}m`, decimal: decimalHours.toFixed(1) };
}

// after teacherData is set (e.g. right in the render part)
const totalWeeklyMinutes = computeTotalWeeklyMinutes(mockTeacherData.timetable);
const formatted = formatMinutes(totalWeeklyMinutes);

export default function TeacherDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [teacherData, setTeacherData] = useState<Teacher | null>(null);
  const [todayClasses, setTodayClasses] = useState<TodayClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDay, setCurrentDay] = useState("Monday");

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      setCurrentUser(null);
      router.replace("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.email) {
        setCurrentUser(user);
        fetchTeacherData(user.email);
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchTeacherData = async (email: string) => {
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      setTeacherData(mockTeacherData);

      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      // const today = days[new Date().getDay()];
      // setCurrentDay(today);

      // Build today's schedule
      const todaysSchedule: TodayClass[] = mockTeacherData.timetable
        .filter((entry) => entry.dayOfWeek.includes("Monday"))
        .map((entry) => ({
          ...entry,
          subject: mockTeacherData.subjects.find(
            (s) => s.code === entry.subjectCode
          ),
          classDetails: mockClassDetails[entry.classId],
        }))
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

      setTodayClasses(todaysSchedule);
    } catch (error) {
      console.error("Error fetching teacher data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTakeAttendance = (
    classId: string,
    subjectCode: string,
    timetableId: string
  ) => {
    router.push(`/attendance/${timetableId}/${classId}/${subjectCode}`);
  };

  // ================= UI RENDER =================

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || !teacherData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">Please log in to view your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {teacherData.name}
                </h1>
                <p className="text-gray-600 mt-1">
                  Teacher ID: {teacherData.id}
                </p>
              </div>
            </div>
            <div className="text-right justify-right">
              <div className="flex text-right w-full gap-2 text-gray-700 mb-2 cursor-pointer" onClick={handleLogout}>
                <LogOut className="w-4 h-4"/>
                <span className="text-sm">Logout</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 mb-2">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{teacherData.officialEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="w-4 h-4" />
                <span className="text-sm">{teacherData.phone}</span>
              </div>
            </div>
          </div>

          {/* Subjects */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Subjects Teaching
            </h3>
            <div className="flex flex-wrap gap-3">
              {teacherData.subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-200"
                >
                  <p className="font-medium text-indigo-900">{subject.name}</p>
                  <p className="text-sm text-indigo-600">
                    {subject.code} • {subject.credits} credits
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-7 h-7 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Today&apos;s Schedule
            </h2>
            <span className="ml-auto text-lg font-semibold text-indigo-600">
              {currentDay}
            </span>
          </div>

          {todayClasses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-500">
                No classes scheduled for today
              </p>
              <p className="text-gray-400 mt-2">Enjoy your day off!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayClasses.map((classItem) => (
                <div
                  key={classItem.id}
                  className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2 text-indigo-600 font-semibold text-lg">
                          <Clock className="w-5 h-5" />
                          <span>
                            {classItem.startTime} - {classItem.endTime}
                          </span>
                        </div>
                        {classItem.classroom && (
                          <div className="flex items-center gap-1 text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-sm">
                            <MapPin className="w-4 h-4" />
                            <span>{classItem.classroom}</span>
                          </div>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {classItem.subject?.name}
                      </h3>

                      <div className="flex items-center gap-4 text-gray-600">
                        <span className="font-medium">
                          {classItem.subject?.code}
                        </span>
                        <span>•</span>
                        <span>
                          {classItem.classDetails?.branch} - Section{" "}
                          {classItem.classDetails?.section}
                        </span>
                        <span>•</span>
                        <span>
                          Batch {classItem.classDetails?.batchStart}-
                          {classItem.classDetails?.batchEnd}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        handleTakeAttendance(
                          classItem.classId,
                          classItem.subjectCode,
                          classItem.id
                        )
                      }
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                      Take Attendance
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Subjects</p>
                <p className="text-2xl font-bold text-gray-900">
                  {teacherData.subjects.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Today&apos;s Classes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {todayClasses.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Weekly Hours</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatted.text} {/* e.g. "14h 10m" */}
                </p>
                {/* optional: show decimal */}
                <p className="text-sm text-gray-500">{formatted.decimal} hrs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
