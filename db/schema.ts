interface Admin {
    id: string;
    name: string;
    phone: number;
    email: string;
}

interface Subject {
    id: string;
    name: string;
    code: string;
    credits: number;
}

interface AttendanceRecord {
    date: Date;
    present: boolean;
}

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
    subjects: string[];
}

interface Class {
    id: string;
    branch: string;
    batchStart: number;
    batchEnd: number;
    section: string;
    students: Student[];
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
