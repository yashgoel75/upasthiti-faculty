"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { Calendar, Clock, BookOpen, User, Phone, Mail, MapPin } from "lucide-react";
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
    { id: "S001", name: "Data Structures", code: "CS201", credits: 4 },
    { id: "S002", name: "Algorithms", code: "CS202", credits: 4 },
    { id: "S003", name: "Database Systems", code: "CS301", credits: 3 }
  ],
  timetable: [
    {
      id: "TT001",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Friday"],
      startTime: "09:00",
      endTime: "10:00",
      classId: "C001",
      subjectCode: "CS201",
      classroom: "Room 301"
    },
    {
      id: "TT002",
      dayOfWeek: ["Tuesday", "Thursday"],
      startTime: "10:15",
      endTime: "11:15",
      classId: "C002",
      subjectCode: "CS202",
      classroom: "Room 405"
    },
    {
      id: "TT003",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday"],
      startTime: "14:00",
      endTime: "15:00",
      classId: "C003",
      subjectCode: "CS301",
      classroom: "Lab 2"
    },
    {
      id: "TT004",
      dayOfWeek: ["Friday"],
      startTime: "11:30",
      endTime: "12:30",
      classId: "C001",
      subjectCode: "CS201",
      classroom: "Room 301"
    }
  ]
};

const mockClassDetails: Record<string, ClassDetails> = {
  C001: { id: "C001", branch: "CSE", batchStart: 2022, batchEnd: 2026, section: "A" },
  C002: { id: "C002", branch: "CSE", batchStart: 2023, batchEnd: 2027, section: "B" },
  C003: { id: "C003", branch: "CSE", batchStart: 2022, batchEnd: 2026, section: "C" }
};

// ================= COMPONENT =================

export default function TeacherDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [teacherData, setTeacherData] = useState<Teacher | null>(null);
  const [todayClasses, setTodayClasses] = useState<TodayClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDay, setCurrentDay] = useState("");

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

      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const today = days[new Date().getDay()];
      setCurrentDay(today);

      // Build today's schedule
      const todaysSchedule: TodayClass[] = mockTeacherData.timetable
        .filter((entry) => entry.dayOfWeek.includes(today))
        .map((entry) => ({
          ...entry,
          subject: mockTeacherData.subjects.find((s) => s.code === entry.subjectCode),
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

  const handleTakeAttendance = (classId: string, subjectCode: string, timetableId: string) => {
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
          <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
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
                <h1 className="text-3xl font-bold text-gray-900">{teacherData.name}</h1>
                <p className="text-gray-600 mt-1">Teacher ID: {teacherData.id}</p>
              </div>
            </div>
            <div className="text-right">
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
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Subjects Teaching</h3>
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
            <h2 className="text-2xl font-bold text-gray-900">Today&apos;s Schedule</h2>
            <span className="ml-auto text-lg font-semibold text-indigo-600">{currentDay}</span>
          </div>

          {todayClasses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-500">No classes scheduled for today</p>
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
                        <span className="font-medium">{classItem.subject?.code}</span>
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
                        handleTakeAttendance(classItem.classId, classItem.subjectCode, classItem.id)
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
                <p className="text-2xl font-bold text-gray-900">{teacherData.subjects.length}</p>
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
                <p className="text-2xl font-bold text-gray-900">{todayClasses.length}</p>
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
                <p className="text-2xl font-bold text-gray-900">{teacherData.timetable.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
