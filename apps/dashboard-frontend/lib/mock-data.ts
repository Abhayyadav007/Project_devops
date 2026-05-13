export interface MockEntity {
  id: number;
  name: string;
  uniqueId: number;
  email: string;
  createdAt: string;
  status: "active" | "inactive";
}

export interface MockMessage {
  id: string;
  from: string;
  fromRole: string;
  to: string;
  toRole: string;
  subject: string;
  body: string;
  timestamp: string;
  read: boolean;
  starred: boolean;
  folder: "inbox" | "sent" | "drafts" | "trash";
}

const now = new Date();
function daysAgo(n: number) {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export const MOCK_UPPER_MANAGEMENT: MockEntity[] = [
  { id: 1, name: "Sarah Williams", uniqueId: 20001, email: "sarah.w@hope.edu", createdAt: daysAgo(30), status: "active" },
  { id: 2, name: "James Mitchell", uniqueId: 20002, email: "james.m@hope.edu", createdAt: daysAgo(25), status: "active" },
  { id: 3, name: "Emily Chen", uniqueId: 20003, email: "emily.c@hope.edu", createdAt: daysAgo(18), status: "inactive" },
];

export const MOCK_ADMINS: MockEntity[] = [
  { id: 1, name: "David Park", uniqueId: 30001, email: "david.p@hope.edu", createdAt: daysAgo(20), status: "active" },
  { id: 2, name: "Lisa Johnson", uniqueId: 30002, email: "lisa.j@hope.edu", createdAt: daysAgo(15), status: "active" },
  { id: 3, name: "Michael Brown", uniqueId: 30003, email: "michael.b@hope.edu", createdAt: daysAgo(10), status: "active" },
  { id: 4, name: "Rachel Green", uniqueId: 30004, email: "rachel.g@hope.edu", createdAt: daysAgo(5), status: "inactive" },
];

export const MOCK_TEACHERS: MockEntity[] = [
  { id: 1, name: "Dr. Robert Harris", uniqueId: 40001, email: "robert.h@hope.edu", createdAt: daysAgo(14), status: "active" },
  { id: 2, name: "Prof. Maria Garcia", uniqueId: 40002, email: "maria.g@hope.edu", createdAt: daysAgo(12), status: "active" },
  { id: 3, name: "Dr. Alan Turing", uniqueId: 40003, email: "alan.t@hope.edu", createdAt: daysAgo(8), status: "active" },
];

export const MOCK_STUDENTS: MockEntity[] = [
  { id: 1, name: "Alice Johnson", uniqueId: 50001, email: "alice.j@hope.edu", createdAt: daysAgo(10), status: "active" },
  { id: 2, name: "Bob Smith", uniqueId: 50002, email: "bob.s@hope.edu", createdAt: daysAgo(9), status: "active" },
  { id: 3, name: "Charlie Davis", uniqueId: 50003, email: "charlie.d@hope.edu", createdAt: daysAgo(7), status: "active" },
  { id: 4, name: "Diana Wilson", uniqueId: 50004, email: "diana.w@hope.edu", createdAt: daysAgo(5), status: "active" },
  { id: 5, name: "Eve Martinez", uniqueId: 50005, email: "eve.m@hope.edu", createdAt: daysAgo(3), status: "inactive" },
];

export const MOCK_MESSAGES: MockMessage[] = [
  {
    id: "msg-1",
    from: "Dr. Robert Harris",
    fromRole: "teacher",
    to: "You",
    toRole: "admin",
    subject: "Regarding Semester Schedule",
    body: "Hello,\n\nI wanted to discuss the upcoming semester schedule. There are a few conflicts with the lab sessions that need to be resolved before enrollment opens.\n\nCould we set up a meeting this week to go over the details?\n\nBest regards,\nDr. Robert Harris",
    timestamp: daysAgo(0),
    read: false,
    starred: true,
    folder: "inbox",
  },
  {
    id: "msg-2",
    from: "Sarah Williams",
    fromRole: "uppermanagement",
    to: "You",
    toRole: "admin",
    subject: "Budget Approval for Q3",
    body: "Hi,\n\nThe budget proposal you submitted for Q3 has been reviewed and approved. Please proceed with the planned allocations.\n\nLet me know if you need any additional resources.\n\nRegards,\nSarah Williams",
    timestamp: daysAgo(1),
    read: true,
    starred: false,
    folder: "inbox",
  },
  {
    id: "msg-3",
    from: "Alice Johnson",
    fromRole: "student",
    to: "You",
    toRole: "admin",
    subject: "Request for Course Change",
    body: "Dear Admin,\n\nI would like to request a course change from CS201 to CS301. I have completed the prerequisites and believe I am ready for the advanced course.\n\nPlease let me know the process for this change.\n\nThank you,\nAlice Johnson",
    timestamp: daysAgo(2),
    read: true,
    starred: false,
    folder: "inbox",
  },
  {
    id: "msg-4",
    from: "You",
    fromRole: "admin",
    to: "Prof. Maria Garcia",
    toRole: "teacher",
    subject: "New Lab Equipment Arrival",
    body: "Dear Prof. Garcia,\n\nI am pleased to inform you that the new lab equipment has arrived and will be set up by Friday. Please coordinate with the lab assistants for installation.\n\nBest,\nAdmin",
    timestamp: daysAgo(1),
    read: true,
    starred: false,
    folder: "sent",
  },
  {
    id: "msg-5",
    from: "You",
    fromRole: "admin",
    to: "All Students",
    toRole: "student",
    subject: "Campus Maintenance Notice",
    body: "Dear Students,\n\nPlease note that the main library will be closed for maintenance on Saturday. Alternative study spaces will be available in Building C.\n\nThank you for your understanding.\n\nAdmin Office",
    timestamp: daysAgo(3),
    read: true,
    starred: false,
    folder: "sent",
  },
  {
    id: "msg-6",
    from: "James Mitchell",
    fromRole: "uppermanagement",
    to: "You",
    toRole: "admin",
    subject: "Annual Review Reminder",
    body: "Hi,\n\nThis is a reminder that the annual performance reviews are due by the end of this month. Please ensure all faculty evaluations are completed and submitted.\n\nBest,\nJames Mitchell",
    timestamp: daysAgo(4),
    read: true,
    starred: true,
    folder: "inbox",
  },
  {
    id: "msg-7",
    from: "Dr. Alan Turing",
    fromRole: "teacher",
    to: "You",
    toRole: "admin",
    subject: "Research Grant Application",
    body: "Hello,\n\nI would like to submit a research grant application for the AI Ethics project. The proposal is attached and I need administrative approval before the deadline next Monday.\n\nCould you review and approve at your earliest convenience?\n\nThank you,\nDr. Alan Turing",
    timestamp: daysAgo(5),
    read: false,
    starred: false,
    folder: "inbox",
  },
];

export function getMockEntitiesForRole(role: string): { entities: MockEntity[]; label: string } {
  switch (role) {
    case "validator":
      return { entities: MOCK_UPPER_MANAGEMENT, label: "Upper Management" };
    case "uppermanagement":
      return { entities: MOCK_ADMINS, label: "Admins" };
    case "admin":
      return { entities: [...MOCK_TEACHERS, ...MOCK_STUDENTS], label: "Teachers & Students" };
    default:
      return { entities: [], label: "Members" };
  }
}

export function getMockStats(role: string) {
  switch (role) {
    case "validator":
      return [
        { label: "Upper Management", value: MOCK_UPPER_MANAGEMENT.length, change: "+1 this month" },
        { label: "Total Active", value: MOCK_UPPER_MANAGEMENT.filter(e => e.status === "active").length, change: "2 active" },
        { label: "Messages", value: 12, change: "3 unread" },
      ];
    case "uppermanagement":
      return [
        { label: "Admins", value: MOCK_ADMINS.length, change: "+2 this month" },
        { label: "Total Active", value: MOCK_ADMINS.filter(e => e.status === "active").length, change: "3 active" },
        { label: "Messages", value: 8, change: "1 unread" },
      ];
    case "admin":
      return [
        { label: "Teachers", value: MOCK_TEACHERS.length, change: "+1 this week" },
        { label: "Students", value: MOCK_STUDENTS.length, change: "+2 this week" },
        { label: "Active Users", value: MOCK_TEACHERS.filter(e => e.status === "active").length + MOCK_STUDENTS.filter(e => e.status === "active").length, change: "7 active" },
        { label: "Messages", value: 24, change: "5 unread" },
      ];
    case "teacher":
      return [
        { label: "Courses", value: 3, change: "Fall semester" },
        { label: "Students", value: 45, change: "Across all courses" },
        { label: "Messages", value: 6, change: "2 unread" },
      ];
    case "student":
      return [
        { label: "Courses", value: 4, change: "Current semester" },
        { label: "Assignments", value: 7, change: "3 pending" },
        { label: "Messages", value: 4, change: "1 unread" },
      ];
    default:
      return [];
  }
}
