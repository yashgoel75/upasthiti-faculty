"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Check, X, User, Calendar, Search, Filter, Save } from "lucide-react";
import { useRouter } from "next/navigation";
const mockRouteParams = {
  timetableId: "TT001",
  classId: "C001",
  subjectCode: "CS201"
};

interface Student {
  id: string;
  name: string;
  phone: number;
  email: string;
  branch: string;
  section: string;
  batchStart: number;
  batchEnd: number;
  creditsObtained: number;
}

interface AttendanceRecord {
  studentId: string;
  present: boolean;
  marked: boolean;
}

interface ClassDetails {
  id: string;
  branch: string;
  batchStart: number;
  batchEnd: number;
  section: string;
}

interface Subject {
  code: string;
  name: string;
  credits: number;
}

// Mock students data
const mockStudents: Student[] = [
  { id: "2022UCS001", name: "Aarav Sharma", phone: 9876543210, email: "aarav@example.com", branch: "CSE", section: "A", batchStart: 2022, batchEnd: 2026, creditsObtained: 45 },
  { id: "2022UCS002", name: "Ananya Verma", phone: 9876543211, email: "ananya@example.com", branch: "CSE", section: "A", batchStart: 2022, batchEnd: 2026, creditsObtained: 48 },
  { id: "2022UCS003", name: "Arjun Patel", phone: 9876543212, email: "arjun@example.com", branch: "CSE", section: "A", batchStart: 2022, batchEnd: 2026, creditsObtained: 42 },
  { id: "2022UCS004", name: "Diya Reddy", phone: 9876543213, email: "diya@example.com", branch: "CSE", section: "A", batchStart: 2022, batchEnd: 2026, creditsObtained: 50 },
  { id: "2022UCS005", name: "Ishaan Kumar", phone: 9876543214, email: "ishaan@example.com", branch: "CSE", section: "A", batchStart: 2022, batchEnd: 2026, creditsObtained: 44 },
  { id: "2022UCS006", name: "Kavya Singh", phone: 9876543215, email: "kavya@example.com", branch: "CSE", section: "A", batchStart: 2022, batchEnd: 2026, creditsObtained: 47 },
  { id: "2022UCS007", name: "Rohan Gupta", phone: 9876543216, email: "rohan@example.com", branch: "CSE", section: "A", batchStart: 2022, batchEnd: 2026, creditsObtained: 41 },
  { id: "2022UCS008", name: "Saanvi Joshi", phone: 9876543217, email: "saanvi@example.com", branch: "CSE", section: "A", batchStart: 2022, batchEnd: 2026, creditsObtained: 49 },
  { id: "2022UCS009", name: "Vihaan Mehta", phone: 9876543218, email: "vihaan@example.com", branch: "CSE", section: "A", batchStart: 2022, batchEnd: 2026, creditsObtained: 43 },
  { id: "2022UCS010", name: "Zara Khan", phone: 9876543219, email: "zara@example.com", branch: "CSE", section: "A", batchStart: 2022, batchEnd: 2026, creditsObtained: 46 },
  { id: "2022UCS011", name: "Aditya Nair", phone: 9876543220, email: "aditya@example.com", branch: "CSE", section: "A", batchStart: 2022, batchEnd: 2026, creditsObtained: 45 },
  { id: "2022UCS012", name: "Myra Kapoor", phone: 9876543221, email: "myra@example.com", branch: "CSE", section: "A", batchStart: 2022, batchEnd: 2026, creditsObtained: 48 },
];

const mockClassDetails: ClassDetails = {
  id: "C001",
  branch: "CSE",
  batchStart: 2022,
  batchEnd: 2026,
  section: "A"
};

const mockSubject: Subject = {
  code: "CS201",
  name: "Data Structures",
  credits: 4
};

export default function TakeAttendance() {
    const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "present" | "absent" | "unmarked">("all");
  const [currentDate] = useState(new Date().toLocaleDateString('en-IN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }));

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setStudents(mockStudents);
      setClassDetails(mockClassDetails);
      setSubject(mockSubject);
      
      const initialAttendance: Record<string, AttendanceRecord> = {};
      mockStudents.forEach(student => {
        initialAttendance[student.id] = {
          studentId: student.id,
          present: false,
          marked: false
        };
      });
      setAttendance(initialAttendance);
      
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = (studentId: string, present: boolean) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        studentId,
        present,
        marked: true
      }
    }));
  };

  const markAll = (present: boolean) => {
    const updated = { ...attendance };
    Object.keys(updated).forEach(studentId => {
      updated[studentId] = {
        studentId,
        present,
        marked: true
      };
    });
    setAttendance(updated);
  };

  const saveAttendance = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert("Attendance saved successfully!");
    } catch (error) {
      console.error("Error saving attendance:", error);
      alert("Failed to save attendance. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const getFilteredStudents = () => {
    let filtered = students;
    
    if (searchQuery) {
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filterStatus !== "all") {
      filtered = filtered.filter(student => {
        const record = attendance[student.id];
        if (filterStatus === "present") return record.marked && record.present;
        if (filterStatus === "absent") return record.marked && !record.present;
        if (filterStatus === "unmarked") return !record.marked;
        return true;
      });
    }
    
    return filtered;
  };

  const getStats = () => {
    const total = students.length;
    const marked = Object.values(attendance).filter(a => a.marked).length;
    const present = Object.values(attendance).filter(a => a.marked && a.present).length;
    const absent = Object.values(attendance).filter(a => a.marked && !a.present).length;
    const unmarked = total - marked;
    
    return { total, marked, present, absent, unmarked };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading attendance...</p>
        </div>
      </div>
    );
  }

  const stats = getStats();
  const filteredStudents = getFilteredStudents();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button 
            onClick={() => {router.push("/dashboard")}}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {subject?.name}
                </h1>
                <p className="text-gray-600 text-lg">{subject?.code} • {subject?.credits} Credits</p>
              </div>
              <div className="text-left md:text-right">
                <div className="flex items-center gap-2 text-gray-700 mb-2">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">{currentDate}</span>
                </div>
                <div className="text-gray-600">
                  {classDetails?.branch} - Section {classDetails?.section} • Batch {classDetails?.batchStart}-{classDetails?.batchEnd}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm mb-1">Total Students</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm mb-1">Marked</p>
            <p className="text-2xl font-bold text-blue-600">{stats.marked}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm mb-1">Present</p>
            <p className="text-2xl font-bold text-green-600">{stats.present}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm mb-1">Absent</p>
            <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm mb-1">Unmarked</p>
            <p className="text-2xl font-bold text-orange-600">{stats.unmarked}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as "all" | "present" | "absent" | "unmarked")}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Students</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="unmarked">Unmarked</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => markAll(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Mark All Present
            </button>
            <button
              onClick={() => markAll(false)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Mark All Absent
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Student ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map((student) => {
                  const record = attendance[student.id];
                  return (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-indigo-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                      <td className="px-6 py-4 text-center">
                        {!record.marked ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Unmarked
                          </span>
                        ) : record.present ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Present
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Absent
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => markAttendance(student.id, true)}
                            className={`p-2 rounded-lg transition-all ${
                              record.marked && record.present
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600'
                            }`}
                            title="Mark Present"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => markAttendance(student.id, false)}
                            className={`p-2 rounded-lg transition-all ${
                              record.marked && !record.present
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
                            }`}
                            title="Mark Absent"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-500">No students found</p>
              <p className="text-gray-400 mt-2">Try adjusting your search or filter</p>
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <button
            onClick={saveAttendance}
            disabled={saving || stats.unmarked > 0}
            className={`flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-lg transition-all ${
              saving || stats.unmarked > 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
            }`}
          >
            <Save className="w-6 h-6" />
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>

        {stats.unmarked > 0 && (
          <p className="text-center mt-4 text-orange-600 font-medium">
            Please mark all students before saving ({stats.unmarked} unmarked)
          </p>
        )}
      </div>
    </div>
  );
}