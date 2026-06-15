export interface Employee {
  id: string;
  name: string;
  position: string;
  avatar: string; // dicebear avatar seed
  dept: string;
  password?: string;
}

export interface LogEntry {
  id: string;
  name: string;
  dept: string;
  type: "Check-In" | "Check-Out";
  time: string; // e.g. "2026-06-15 07:54:12"
  scanMethod: "QR Code" | "Face Scan";
  distance: string; // e.g. "12m"
  status: string; // e.g. "ទាន់ម៉ោង" | "យឺតយ៉ាវ" | "ចេញធ្វើការ"
}

export interface OfficeSettings {
  lat: number;
  lng: number;
  radius: number; // meters
  inTime: string; // "08:00"
}
