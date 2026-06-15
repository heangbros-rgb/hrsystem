import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { motion, AnimatePresence } from "motion/react";
import {
  Fingerprint,
  IdCard,
  Key,
  Check,
  LogIn,
  LogOut,
  Wifi,
  Battery,
  UserCheck,
  UserX,
  Clock,
  Users,
  QrCode,
  Camera,
  Building,
  Home,
  Plus,
  Trash2,
  Download,
  FileText,
  Send,
  MapPin,
  Compass,
  Eye,
  EyeOff,
  Shield,
  Smartphone,
  AlertTriangle,
  Info,
  X,
  Menu,
} from "lucide-react";
import { Employee, LogEntry, OfficeSettings } from "./types";
import { CustomDialog } from "./components/CustomDialog";

// --- DEFAULT STATE CONSTANTS ---
const DEFAULT_EMPLOYEES: Employee[] = [
  { id: "EMP-045", name: "ស៊ូ សេងហួរ", position: "IT Developer", avatar: "Felix", dept: "IT", password: "1234" },
  { id: "EMP-012", name: "ចាន់ ស្រីនាថ", position: "HR Officer", avatar: "Aneka", dept: "HR", password: "1234" },
  { id: "EMP-078", name: "កែវ វិសាល", position: "Accountant", avatar: "Milo", dept: "Finance", password: "1234" },
];

const DEFAULT_LOGS: LogEntry[] = [
  { id: "EMP-045", name: "ស៊ូ សេងហួរ", dept: "IT", type: "Check-In", time: "2026-06-15 07:54:12", scanMethod: "QR Code", distance: "12m", status: "ទាន់ម៉ោង" },
  { id: "EMP-012", name: "ចាន់ ស្រីនាថ", dept: "HR", type: "Check-In", time: "2026-06-15 08:12:05", scanMethod: "Face Scan", distance: "45m", status: "យឺតយ៉ាវ" },
  { id: "EMP-078", name: "កែវ វិសាល", dept: "Finance", type: "Check-In", time: "2026-06-15 07:48:33", scanMethod: "QR Code", distance: "8m", status: "ទាន់ម៉ោង" },
];

const DEFAULT_OFFICE: OfficeSettings = {
  lat: 11.5564,
  lng: 104.9282,
  radius: 100, // meters
  inTime: "08:00",
};

export default function App() {
  // --- DATABASE & STATE RECOVERY ---
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem("smart_attendance_employees");
    return saved ? JSON.parse(saved) : DEFAULT_EMPLOYEES;
  });

  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem("smart_attendance_logs");
    return saved ? JSON.parse(saved) : DEFAULT_LOGS;
  });

  const [office, setOffice] = useState<OfficeSettings>(() => {
    const saved = localStorage.getItem("smart_attendance_office_settings");
    return saved ? JSON.parse(saved) : DEFAULT_OFFICE;
  });

  const [loggedInEmployee, setLoggedInEmployee] = useState<Employee | null>(() => {
    const saved = localStorage.getItem("smart_attendance_logged_user");
    return saved ? JSON.parse(saved) : null;
  });

  // --- LOCAL PERSISTENCE TRiggers ---
  useEffect(() => {
    localStorage.setItem("smart_attendance_employees", JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem("smart_attendance_logs", JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem("smart_attendance_office_settings", JSON.stringify(office));
  }, [office]);

  useEffect(() => {
    if (loggedInEmployee) {
      localStorage.setItem("smart_attendance_logged_user", JSON.stringify(loggedInEmployee));
    } else {
      localStorage.removeItem("smart_attendance_logged_user");
    }
  }, [loggedInEmployee]);

  // --- COMPONENT LEVEL VIEWS & MOCK STATES ---
  const [activePortalTab, setActivePortalTab] = useState<"employee" | "admin">("employee");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem("smart_attendance_admin_logged") === "true";
  });

  // Form Inputs
  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Signup fields
  const [regName, setRegName] = useState("");
  const [regId, setRegId] = useState("");
  const [regDept, setRegDept] = useState("");
  const [regPosition, setRegPosition] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regAvatar, setRegAvatar] = useState("Felix");

  // Phone Simulation State
  const [simulatedLocMode, setSimulatedLocMode] = useState<"office" | "home">("office");
  const [empLat, setEmpLat] = useState(11.5564);
  const [empLng, setEmpLng] = useState(104.9282);
  const [scanMethod, setScanMethod] = useState<"qr" | "face">("qr");

  // Admin lock passcode form
  const [adminPasscode, setAdminPasscode] = useState("");
  const [showAdminPasscode, setShowAdminPasscode] = useState(false);

  // Create Employee modal state
  const [isNewEmpModalOpen, setIsNewEmpModalOpen] = useState(false);
  const [newEmpName, setNewEmpName] = useState("");
  const [newEmpId, setNewEmpId] = useState("");
  const [newEmpDept, setNewEmpDept] = useState("");
  const [newEmpPosition, setNewEmpPosition] = useState("");
  const [newEmpPassword, setNewEmpPassword] = useState("");
  const [newEmpAvatar, setNewEmpAvatar] = useState("Felix");

  // Monthly Report modal state
  const [isMonthlyReportModalOpen, setIsMonthlyReportModalOpen] = useState(false);
  const [selectedReportMonth, setSelectedReportMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  // Real webcam camera streams
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isRealCameraActive, setIsRealCameraActive] = useState(false);

  // Custom Alerts Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"success" | "error" | "warning">("success");
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");

  // Telegram Mock logs
  const [telegramLogs, setTelegramLogs] = useState<string[]>(() => {
    return [
      "// ប្រព័ន្ធ Telegram Bot បានចាប់ផ្តើមការត្រៀមលក្ខណៈ...",
      "// រង់ចាំការស្កែនវត្តមានរបស់បុគ្គលិកដើម្បីបញ្ជូនសារ...",
    ];
  });
  const [telegramToken, setTelegramToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");

  // Simulated Time display
  const [timeString, setTimeString] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString("km-KH", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update employee simulated lat/lng whenever settings change
  useEffect(() => {
    if (simulatedLocMode === "office") {
      setEmpLat(office.lat + 0.00015);
      setEmpLng(office.lng - 0.00012);
    } else {
      setEmpLat(office.lat + 0.045);
      setEmpLng(office.lng - 0.031);
    }
  }, [simulatedLocMode, office]);

  // Handle stream cleanup
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mediaStream]);

  // --- UTILITY HELPER FUNCS ---
  const triggerDialog = (type: "success" | "error" | "warning", title: string, message: string) => {
    setDialogType(type);
    setDialogTitle(title);
    setDialogMessage(message);
    setDialogOpen(true);
  };

  // Math helper for Distance (Haversine Formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // inside radius
  };

  const calculatedDistance = Math.round(calculateDistance(empLat, empLng, office.lat, office.lng));
  const isWithinGeofence = calculatedDistance <= office.radius;

  // --- ACTIONS ---

  // Auth: Log in
  const handleEmployeeLogin = () => {
    if (!loginId.trim() || !loginPassword.trim()) {
      triggerDialog("warning", "បំពេញព័ត៌មាន", "សូមបំពេញអត្តលេខ និង លេខកូដសម្ងាត់របស់អ្នកដើម្បីចូលប្រើប្រាស់!");
      return;
    }

    const matched = employees.find((e) => e.id.toLowerCase() === loginId.trim().toLowerCase());
    if (matched && matched.password === loginPassword.trim()) {
      setLoggedInEmployee(matched);
      setLoginId("");
      setLoginPassword("");
      triggerDialog("success", "ចូលគណនីជោគជ័យ", `សូមស្វាគមន៍មកកាន់ប្រព័ន្ធការងារ\nលោកអ្នកអាចស្កែនវត្តមានបានឥឡូវនេះ!`);
    } else {
      triggerDialog("error", "បរាជ័យក្នុងការចូល", "អត្តលេខបុគ្គលិក ឬ លេខកូដសម្ងាត់ មិនត្រឹមត្រូវឡើយ។ សូមពិនិត្យឡើងវិញ!");
    }
  };

  // Auth: Register
  const handleEmployeeRegister = () => {
    if (!regName.trim() || !regId.trim() || !regDept.trim() || !regPosition.trim() || !regPassword.trim()) {
      triggerDialog("warning", "ខ្វះខាតទិន្នន័យ", "សូមបំពេញគ្រប់ចន្លោះដែលមានសញ្ញាផ្កាយ (*)!");
      return;
    }

    if (employees.some((e) => e.id.toLowerCase() === regId.trim().toLowerCase())) {
      triggerDialog("error", "អត្តលេខបុគ្គលិកស្ទួន", `អត្តលេខ "${regId}" នេះត្រូវបានប្រើប្រាស់រួចហើយ។ សូមជ្រើសរើសអត្តលេខថ្មី!`);
      return;
    }

    const newEmp: Employee = {
      id: regId.trim(),
      name: regName.trim(),
      dept: regDept.trim(),
      position: regPosition.trim(),
      password: regPassword.trim(),
      avatar: regAvatar,
    };

    setEmployees((prev) => [...prev, newEmp]);
    setRegName("");
    setRegId("");
    setRegDept("");
    setRegPosition("");
    setRegPassword("");
    setIsRegisterMode(false);
    setLoginId(newEmp.id); // pre-populate for comfort
    triggerDialog("success", "ចុះឈ្មោះគណនីជោគជ័យ", `គណនីបុគ្គលិករបស់ ${newEmp.name} ត្រូវបានបង្កើតរួចរាល់។ សូមវាយកូដសម្ងាត់ដើម្បីចូលប្រើប្រាស់។`);
  };

  // Auth: Logout
  const handleEmployeeLogout = () => {
    // If stream is active, turn it off
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
      setIsRealCameraActive(false);
    }
    setLoggedInEmployee(null);
    triggerDialog("warning", "បានចាកចេញ", "លោកអ្នកបានចាកចេញពីគណនីបុគ្គលិកដោយជោគជ័យ។");
  };

  // Simulated GPS change
  const setSimulatedLocation = (mode: "office" | "home") => {
    setSimulatedLocMode(mode);
  };

  // Request browser geolocation coordinates
  const fetchRealGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setEmpLat(position.coords.latitude);
          setEmpLng(position.coords.longitude);
          triggerDialog("success", "ទទួលបានទីតាំងពិត", "ប្រព័ន្ធបានទាញយកកូអរដោនេពិតរបស់លោកអ្នកដោយជោគជ័យ។");
        },
        () => {
          triggerDialog("warning", "មិនអាចយក GPS បានទេ", "មិនអាចចូលដំណើរការទីតាំងបានឡើយ។ សូមប្រាកដថាអ្នកបានអនុញ្ញាតសិទ្ធិទីតាំង។");
        }
      );
    } else {
      triggerDialog("error", "ប្រព័ន្ធមិនគាំទ្រ", "កម្មវិធីរុករក (Browser) របស់អ្នកមិនគាំទ្រការទាញយកទីតាំងឡើយ។");
    }
  };

  // Web camera toggle function
  const toggleRealCamera = async () => {
    if (isRealCameraActive) {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
        setMediaStream(null);
      }
      setIsRealCameraActive(false);
    } else {
      try {
        const streamObj = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });
        setMediaStream(streamObj);
        setIsRealCameraActive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = streamObj;
        }
      } catch (err) {
        triggerDialog("warning", "មិនអាចបើកកាមេរ៉ា", "មិនអាចចាប់យកកាមេរ៉ាឧបករណ៍បានឡើយ។ ប្រព័ន្ធនឹងប្រើប្រាស់ប្រអប់ស្កែនសិប្បនិម្មិតជំនួសវិញ។");
      }
    }
  };

  // Submit scan events
  const executeAttendance = (type: "Check-In" | "Check-Out") => {
    if (!loggedInEmployee) {
      triggerDialog("warning", "សូមចូលប្រើប្រាស់គណនី", "សូមធ្វើការ Log In គណនីបុគ្គលិករបស់អ្នកជាមុនសិន!");
      return;
    }

    if (!isWithinGeofence) {
      triggerDialog(
        "error",
        "ការស្កែនត្រូវបានបដិសេធ",
        `លោកអ្នកស្ថិតនៅចម្ងាយ ${calculatedDistance.toLocaleString()} ម៉ែត្រ ឆ្ងាយពីការិយាល័យ (ការិយាល័យតម្រូវឱ្យស្កែនក្នុងរង្វង់ ${office.radius} ម៉ែត្រ)។\n\nសូមទៅជិតការិយាល័យរួចព្យាយាមម្តងទៀត!`
      );
      return;
    }

    const now = new Date();
    const hour = now.getHours();
    const min = now.getMinutes();
    const checkTimeStr = now.toLocaleTimeString("km-KH", { hour12: false });
    const dateStr = now.toISOString().split("T")[0];

    let status = "ទាន់ម៉ោង";
    if (type === "Check-In") {
      const [targetHour, targetMin] = office.inTime.split(":").map(Number);
      if (hour > targetHour || (hour === targetHour && min > targetMin)) {
        status = "យឺតយ៉ាវ";
      }
    } else {
      status = "ចេញធ្វើការ";
    }

    const newLog: LogEntry = {
      id: loggedInEmployee.id,
      name: loggedInEmployee.name,
      dept: loggedInEmployee.dept,
      type: type,
      time: `${dateStr} ${checkTimeStr}`,
      scanMethod: scanMethod === "qr" ? "QR Code" : "Face Scan",
      distance: `${calculatedDistance}m`,
      status: status,
    };

    setLogs((prev) => [newLog, ...prev]);

    // Push bot message report
    triggerTelegramNotification(newLog);

    triggerDialog(
      "success",
      "ស្កែនវត្តមានជោគជ័យ",
      `បុគ្គលិក៖ ${loggedInEmployee.name} (${loggedInEmployee.dept})\nប្រភេទ៖ ${type}\nម៉ោង៖ ${checkTimeStr}\nស្ថានភាព៖ ${status}\nចម្ងាយពីក្រុមហ៊ុន៖ ${calculatedDistance} ម៉ែត្រ`
    );
  };

  // Telegram Message Log
  const triggerTelegramNotification = (log: LogEntry) => {
    const textMsg = `🔔 <b>របាយការណ៍វត្តមានបុគ្គលិក</b>
------------------------------
🧑‍💼 <b>ឈ្មោះ៖</b> ${log.name}
🏢 <b>ផ្នែក៖</b> ${log.dept} (ID: ${log.id})
📌 <b>សកម្មភាព៖</b> ${log.type}
🕒 <b>ម៉ោងស្កែន៖</b> ${log.time}
📱 <b>មធ្យោបាយ៖</b> ${log.scanMethod}
📍 <b>ចម្ងាយ៖</b> ${log.distance} (ក្នុងរង្វង់កំណត់)
📊 <b>ស្ថានភាព៖</b> ${log.status}
------------------------------`;

    // Visual Log in local developer area
    const timeFormatted = new Date().toLocaleTimeString("km-KH");
    setTelegramLogs((prev) => [
      ...prev,
      `[${timeFormatted}] // ឧបករណ៍ត្រួតពិនិត្យកំណត់ត្រា៖`,
      textMsg.replace(/<\/?[^>]+(>|$)/g, ""), // strip active html tags for console block
    ]);

    // True dispatch to Telegram HTTP Server (if token & chat configured)
    if (telegramToken && telegramChatId) {
      const url = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: textMsg,
          parse_mode: "HTML",
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.ok) {
            setTelegramLogs((prev) => [
              ...prev,
              `[${timeFormatted}] ✅ បានផ្ញើទៅកាន់ Telegram Chat (${telegramChatId}) ជោគជ័យ!`,
            ]);
          } else {
            setTelegramLogs((prev) => [
              ...prev,
              `[${timeFormatted}] ❌ កំហុស Telegram: ${data.description}`,
            ]);
          }
        })
        .catch((err) => {
          setTelegramLogs((prev) => [
            ...prev,
            `[${timeFormatted}] ❌ កំហុសការស្វែងរក: ${err.message}`,
          ]);
        });
    }
  };

  // Test Telegram Direct Send
  const handleTestTelegramMessage = () => {
    if (!telegramToken.trim() || !telegramChatId.trim()) {
      triggerDialog("warning", "ខ្វះខាតទិន្នន័យ", "សូមបំពេញ Bot Token និង Chat ID ជាមុនសិន ទើបអាចសាកល្បងមុខងារផ្ញើទៅកាន់ទូរស័ព្ទពិតបាន។");
      return;
    }

    const testMsg = `🔔 <b>សារតេស្តតភ្ជាប់ប្រព័ន្ធវត្តមាន</b>\n\nតំណភ្ជាប់ Telegram Bot របស់លោកអ្នកជាមួយប្រព័ន្ធវត្តមានស្វ័យប្រវត្តិដំណើរការយ៉ាងល្អប្រសើរ!`;
    const url = `https://api.telegram.org/bot${telegramToken.trim()}/sendMessage`;
    const timeFormatted = new Date().toLocaleTimeString("km-KH");

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: telegramChatId.trim(),
        text: testMsg,
        parse_mode: "HTML",
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          triggerDialog("success", "តេស្តតភ្ជាប់ជោគជ័យ", "សារត្រូវបានផ្ញើចូលទៅកាន់ Telegram Group / Chat របស់អ្នករួចរាល់ហើយ!");
          setTelegramLogs((prev) => [
            ...prev,
            `[${timeFormatted}] ✅ សារតេស្តគំរូត្រូវបានផ្ញើដោយជោគជ័យ!`,
          ]);
        } else {
          triggerDialog("error", "តេស្តតភ្ជាប់បរាជ័យ", `Telegram ឆ្លើយតប៖ ${data.description}`);
        }
      })
      .catch((err) => {
        triggerDialog("error", "កំហុសបណ្តាញ", `មិនអាចភ្ជាប់ទៅកាន់ប្រព័ន្ធម៉ាស៊ីនមេ Telegram៖ ${err.message}`);
      });
  };

  // Admin Verification
  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasscode === "22334455") {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem("smart_attendance_admin_logged", "true");
      setAdminPasscode("");
      triggerDialog("success", "ចូលប្រព័ន្ធជោគជ័យ", "សូមស្វាគមន៍មកកាន់ផ្ទាំងគ្រប់គ្រងប្រព័ន្ធវត្តមានឆ្លាតវៃ។");
    } else {
      triggerDialog("error", "កូដសម្ងាត់មិនត្រឹមត្រូវ", "លេខកូដសម្ងាត់អ្នកគ្រប់គ្រង (Admin Passcode) គឺមិនត្រឹមត្រូវឡើយ។ សូមព្យាយាមម្តងទៀត! (តម្រុយ៖ 22334455)");
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem("smart_attendance_admin_logged");
    triggerDialog("warning", "បានចាកចេញ", "ផ្ទាំងគ្រប់គ្រងត្រូវបានចាក់សោរឡើងវិញដោយសុវត្ថិភាព។");
  };

  // Adjust Admin Office parameters
  const updateOfficeCoord = (key: keyof OfficeSettings, value: number | string) => {
    setOffice((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const setOfficeToCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateOfficeCoord("lat", parseFloat(position.coords.latitude.toFixed(6)));
          updateOfficeCoord("lng", parseFloat(position.coords.longitude.toFixed(6)));
          triggerDialog("success", "បានកំណត់ការិយាល័យ", "បានកែប្រែទីតាំងការិយាល័យមកកាន់កូអរដោនេបច្ចុប្បន្នរបស់អ្នក។");
        },
        () => {
          triggerDialog("error", "GPS Error", "មិនអាចទាញយកកូអរដោនេបានឡើយ។");
        }
      );
    }
  };

  // Logs modification
  const handleClearLogs = () => {
    setLogs([]);
    triggerDialog("success", "លុបទិន្នន័យ", "រាល់ទិន្នន័យវត្តមានប្រចាំថ្ងៃត្រូវបានសម្អាតរួចរាល់។");
  };

  const handleExportToExcel = () => {
    if (logs.length === 0) {
      triggerDialog("warning", "គ្មានទិន្នន័យ", "មិនអាចទាញយកបានទេ ពីព្រោះគ្មានកំណត់ត្រាវត្តមានសកម្មក្នុងបញ្ជី។");
      return;
    }

    const worksheetData = logs.map((log) => ({
      "អត្តលេខបុគ្គលិក": log.id,
      "ឈ្មោះបុគ្គលិក": log.name,
      "ផ្នែក/ដេប៉ាតឺម៉ង់": log.dept,
      "ប្រភេទការងារ": log.type,
      "កាលបរិច្ឆេទ & ម៉ោង": log.time,
      "មធ្យោបាយស្កែន": log.scanMethod,
      "ចម្ងាយពីក្រុមហ៊ុន": log.distance,
      "ស្ថានភាពវត្តមាន": log.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "របាយការណ៍វត្តមាន");

    const today = new Date().toISOString().split("T")[0];
    const fileName = `របាយការណ៍វត្តមានបុគ្គលិក_${today}.xlsx`;

    XLSX.writeFile(workbook, fileName);
    triggerDialog("success", "ទាញទិន្នន័យជោគជ័យ", `ឯកសារ "${fileName}" ត្រូវបានទាញយកទៅកាន់ឧបករណ៍របស់អ្នករួចរាល់ហើយ។`);
  };

  // --- MONTHLY REPORT HELPERS ---
  const romanizeName = (khmerName: string): string => {
    const clean = khmerName.trim();
    const registry: { [key: string]: string } = {
      "ស៊ូ សេងហួរ": "Sou Senghour",
      "ចាន់ ស្រីនាថ": "Chan Sreynath",
      "កែវ វិសាល": "Keo Visal",
      "សុខ វិបុល": "Sok Vibol",
      "កែវ សំណាង": "Keo Samnang"
    };
    if (registry[clean]) return registry[clean];

    const consonantMap: { [key: string]: string } = {
      'ក': 'K', 'ខ': 'Kh', 'គ': 'K', 'ឃ': 'Kh', 'ង': 'Ng',
      'ច': 'Ch', 'ឆ': 'Ch', 'ជ': 'Ch', 'ឈ': 'Ch', 'ញ': 'Nh',
      'ដ': 'D', 'ឋ': 'Th', 'ឌ': 'D', 'ឍ': 'Th', 'ណ': 'N',
      'ត': 'T', 'ថ': 'Th', 'ទ': 'T', 'ធ': 'Th', 'ន': 'N',
      'ប': 'B', 'ផ': 'Ph', 'ព': 'P', 'ភ': 'Ph', 'ម': 'M',
      'យ': 'Y', 'រ': 'R', 'ល': 'L', 'វ': 'V', 'ស': 'S',
      'ហ': 'H', 'ឡ': 'L', 'អ': 'O'
    };

    const vowelMap: { [key: string]: string } = {
      'ា': 'a', 'ិ': 'i', 'ី': 'ey', 'ឹ': 'ue', 'ឺ': 'u',
      'ុ': 'u', 'ូ': 'ou', 'ួ': 'uor', 'ើ': 'eu', 'ឿ': 'uea', 'ៀ': 'ie',
      'េ': 'e', 'ែ': 'ae', 'ៃ': 'ay', 'ោ': 'ao', 'ៅ': 'au',
      'ុំ': 'om', 'ំ': 'om', 'ាំ': 'am', 'ះ': 'ah', 'ុះ': 'oh', 'េះ': 'eh', 'ោះ': 'oh'
    };

    let result = "";
    for (let i = 0; i < clean.length; i++) {
      const char = clean[i];
      if (consonantMap[char]) {
        result += (result ? " " : "") + consonantMap[char];
      } else if (vowelMap[char]) {
        result += vowelMap[char];
      } else if (char === " ") {
        result += " ";
      } else if ((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z')) {
        result += char;
      }
    }

    result = result.replace(/\s+/g, " ").trim();
    return result.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ") || clean;
  };

  const mapDepartment = (dept: string): string => {
    const d = dept.trim();
    const map: { [key: string]: string } = {
      "IT": "IT Department",
      "HR": "HR Department",
      "Finance": "Finance Department",
      "គណនេយ្យ": "Accounting Department",
      "លក់": "Sales Department",
      "រដ្ឋបាល": "Administration"
    };
    return map[d] || `${d} Dept`;
  };

  const mapType = (type: string): string => {
    return type === "Check-In" ? "Check-In (ចូល)" : "Check-Out (ចេញ)";
  };

  const mapStatus = (status: string): string => {
    const s = status.trim();
    if (s === "ទាន់ម៉ោង") return "On Time (ទាន់ម៉ោង)";
    if (s === "យឺតយ៉ាវ") return "Late (យឺតយ៉ាវ)";
    if (s === "ចេញធ្វើការ") return "Checked Out (ចេញធ្វើការ)";
    return s;
  };

  const getAvailableMonths = () => {
    const monthsSet = new Set<string>();
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    monthsSet.add(currentMonth);

    logs.forEach(log => {
      if (log.time && log.time.length >= 7) {
        const parts = log.time.split(" ")[0].substring(0, 7);
        if (parts && parts.match(/^\d{4}-\d{2}$/)) {
          monthsSet.add(parts);
        }
      }
    });

    return Array.from(monthsSet).sort().reverse();
  };

  const handleGenerateMonthlyReportPDF = () => {
    const reportLogs = logs.filter((log) => {
      if (!log.time) return false;
      return log.time.startsWith(selectedReportMonth);
    });

    if (reportLogs.length === 0) {
      triggerDialog("warning", "គ្មានទិន្នន័យ", `មិនទាន់មានកំណត់ត្រាវត្តមានសម្រាប់ខែ ${selectedReportMonth} ឡើយ។`);
      return;
    }

    const monthlyCheckIns = reportLogs.filter((l) => l.type === "Check-In");
    const onTimeCount = monthlyCheckIns.filter((l) => l.status === "ទាន់ម៉ោង").length;
    const lateCount = monthlyCheckIns.filter((l) => l.status === "យឺតយ៉ាវ").length;
    const uniqueEmployeesCount = new Set(reportLogs.map((l) => l.id)).size;

    const monthName = new Date(`${selectedReportMonth}-02`).toLocaleString("en-US", { month: "long", year: "numeric" });
    const now = new Date();

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const PRIMARY_COLOR: [number, number, number] = [23, 23, 56]; 
    const SECONDARY_COLOR: [number, number, number] = [16, 185, 129]; 

    doc.setFillColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
    doc.rect(0, 0, 210, 40, "F");

    doc.setFillColor(SECONDARY_COLOR[0], SECONDARY_COLOR[1], SECONDARY_COLOR[2]);
    doc.rect(15, 10, 3, 20, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("SMART ATTENDANCE SYSTEM", 22, 18);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(200, 210, 230);
    doc.text("Monthly Staff Attendance Summary Report", 22, 25);

    doc.setTextColor(71, 85, 105);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    
    const genDateStr = now.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    doc.text(`Report Period: ${monthName}`, 195, 50, { align: "right" });
    doc.text(`Generated On: ${genDateStr}`, 195, 55, { align: "right" });

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(15, 60, 195, 60);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("PERFORMANCE SUMMARY STATS", 15, 70);

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, 75, 55, 25, 3, 3, "F");
    doc.roundedRect(75, 75, 55, 25, 3, 3, "F");
    doc.roundedRect(135, 75, 60, 25, 3, 3, "F");

    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("TOTAL TRACKED LOGS", 20, 81);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(23, 23, 56);
    doc.text(`${reportLogs.length} Records`, 20, 92);

    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("ON TIME VS LATE RATE", 80, 81);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(16, 185, 129);
    doc.text(`${onTimeCount} On-Time`, 80, 88);
    doc.setTextColor(245, 158, 11);
    doc.text(`${lateCount} Late scans`, 80, 94);

    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("PARTICIPATING STAFF MEMBERS", 140, 81);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(23, 23, 56);
    doc.text(`${uniqueEmployeesCount} Members`, 140, 92);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("DETAILED MONTHLY TIMESHEET", 15, 112);

    const tableHeaders = [["Employee ID", "Employee Name", "Department", "Date & Time", "Activity Type", "Scan Method", "Status"]];
    const tableData = reportLogs.map(log => [
      log.id,
      romanizeName(log.name),
      mapDepartment(log.dept),
      log.time,
      mapType(log.type),
      log.scanMethod,
      mapStatus(log.status)
    ]);

    autoTable(doc, {
      head: tableHeaders,
      body: tableData,
      startY: 118,
      margin: { left: 15, right: 15 },
      theme: "striped",
      headStyles: {
        fillColor: PRIMARY_COLOR,
        textColor: [255, 255, 255],
        font: "helvetica",
        fontStyle: "bold",
        fontSize: 8,
        halign: "left"
      },
      bodyStyles: {
        font: "helvetica",
        fontSize: 7.5,
        textColor: [51, 65, 85]
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 35 },
        2: { cellWidth: 25 },
        3: { cellWidth: 32 },
        4: { cellWidth: 28 },
        5: { cellWidth: 22 },
        6: { cellWidth: 28 }
      },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 6) {
          const textVal = String(data.cell.raw);
          if (textVal.includes("On Time") || textVal.includes("ទាន់ម៉ោង")) {
            doc.setTextColor(16, 185, 129);
            doc.setFont("helvetica", "bold");
          } else if (textVal.includes("Late") || textVal.includes("យឺតយ៉ាវ")) {
            doc.setTextColor(245, 158, 11);
            doc.setFont("helvetica", "bold");
          }
        }
      }
    });

    const pageCount = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("Smart Attendance Pro - Automated Secure Monthly PDF Transcript", 15, 287);
      doc.text(`Page ${i} of ${pageCount}`, 195, 287, { align: "right" });
    }

    const exportFileName = `Monthly_Report_${selectedReportMonth}.pdf`;
    doc.save(exportFileName);

    triggerDialog("success", "របាយការណ៍ PDF ជោគជ័យ", `របាយការណ៍ប្រចាំខែ "${exportFileName}" ត្រូវបានបង្កើត និងទាញយកដោយជោគជ័យ។`);
  };

  // Add Employee via modal
  const handleCreateEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim() || !newEmpId.trim() || !newEmpDept.trim() || !newEmpPosition.trim() || !newEmpPassword.trim()) {
      triggerDialog("warning", "ខ្វះខាតទិន្នន័យ", "សូមបំពេញគ្រប់លក្ខខណ្ឌនៃសំណុំទិន្នន័យ!");
      return;
    }

    if (employees.some((emp) => emp.id.toLowerCase() === newEmpId.trim().toLowerCase())) {
      triggerDialog("error", "អត្តលេខស្ទួនគ្នា", `អត្តលេខបុគ្គលិក "${newEmpId}" ត្រូវបានប្រើប្រាស់រួចរាល់ហើយនៅក្នុងប្រព័ន្ធ។ សូមប្រើអត្តលេខផ្សេង!`);
      return;
    }

    const created: Employee = {
      id: newEmpId.trim(),
      name: newEmpName.trim(),
      dept: newEmpDept.trim(),
      position: newEmpPosition.trim(),
      password: newEmpPassword.trim(),
      avatar: newEmpAvatar,
    };

    setEmployees((prev) => [...prev, created]);
    setIsNewEmpModalOpen(false);

    // Clear modal settings
    setNewEmpName("");
    setNewEmpId("");
    setNewEmpDept("");
    setNewEmpPosition("");
    setNewEmpPassword("");
    setNewEmpAvatar("Felix");

    triggerDialog("success", "បង្កើតគណនីបុគ្គលិកជោគជ័យ", `បុគ្គលិកឈ្មោះ ${created.name} ត្រូវបានបញ្ចូលទៅក្នុងបញ្ជីកម្មវិធីរួចរាល់ និងអាចប្រើប្រាស់អត្តលេខដើម្បីស្កែនវត្តមានបាន។`);
  };

  // Quick stats computed logic
  const statTotal = logs.length;
  const statOnTime = logs.filter((l) => l.status === "ទាន់ម៉ោង").length;
  const statLate = logs.filter((l) => l.status === "យឺតយ៉ាវ").length;
  const statAbsent = Math.max(0, employees.length - new Set(logs.map((l) => l.id)).size);

  // Monthly Report computed logic
  const filteredMonthlyLogs = logs.filter((log) => {
    if (!log.time) return false;
    return log.time.startsWith(selectedReportMonth);
  });
  const monthlyCheckIns = filteredMonthlyLogs.filter((l) => l.type === "Check-In");
  const monthlyOnTime = monthlyCheckIns.filter((l) => l.status === "ទាន់ម៉ោង").length;
  const monthlyLate = monthlyCheckIns.filter((l) => l.status === "យឺតយ៉ាវ").length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between">
      {/* --- HEADER BAR --- */}
      <header className="bg-indigo-950 text-white shadow-md sticky top-0 z-40 border-b border-indigo-900/60 transition-all">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-col sm:flex-row justify-between items-center gap-3.5">
          {/* Logo Title */}
          <div className="flex items-center space-x-3.5">
            <div className="bg-emerald-500 p-2.5 rounded-xl text-white shadow-lg shadow-emerald-500/25 animate-pulse">
              <Fingerprint className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight flex items-center gap-1.5 font-sans">
                ប្រព័ន្ធវត្តមានឆ្លាតវៃ <span className="text-emerald-400 font-mono text-xs px-2 py-0.5 rounded bg-white/10">v2.0</span>
              </h1>
              <p className="text-[11px] text-indigo-200">គណនីបុគ្គលិកផ្ទាល់ខ្លួន • QR • ស្កែនមុខ • GPS Geofence • Telegram Bot</p>
            </div>
          </div>

          {/* Quick Role View Picker */}
          <div className="flex items-center gap-1.5 bg-indigo-900/40 p-1 rounded-xl border border-indigo-800/80">
            <span className="text-xs text-indigo-300 px-2 font-medium hidden md:inline">ផ្ទាំងបង្ហាញ៖</span>
            <button
              onClick={() => setActivePortalTab("employee")}
              className={`flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                activePortalTab === "employee" ? "bg-emerald-500 text-white shadow-sm" : "text-indigo-200 hover:bg-white/5"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              ផ្នែកបុគ្គលិក (ទូរស័ព្ទ)
            </button>
            <button
              onClick={() => setActivePortalTab("admin")}
              className={`flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                activePortalTab === "admin" ? "bg-emerald-500 text-white shadow-sm" : "text-indigo-200 hover:bg-white/5"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              ផ្នែកគ្រប់គ្រង (Admin)
            </button>
          </div>
        </div>
      </header>

      {/* --- MAIN ROOT CONTAINER --- */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 w-full">
        {/* ======================================== */}
        {/* LEFT COMPONENT: MOBILE PHONE FRAME */}
        {/* ======================================== */}
        <section
          className={`lg:col-span-5 flex flex-col items-center justify-start ${
            activePortalTab !== "employee" ? "hidden lg:flex" : ""
          }`}
        >
          {/* Simulated Mobile Outer Body */}
          <div className="w-full max-w-[390px] bg-slate-950 text-white rounded-[50px] p-4.5 shadow-2xl border-[11px] border-slate-800 relative overflow-hidden flex flex-col justify-between min-h-[790px]">
            {/* Phone Top Status Bar */}
            <div className="flex justify-between items-center px-4 pt-1 pb-4 text-[11px] text-slate-400 z-10 font-mono">
              <span>{timeString.substring(0, 5)}</span>
              {/* Camera Notch Area */}
              <div className="w-32 h-6 bg-slate-900 rounded-b-2xl absolute left-1/2 -translate-x-1/2 top-0 flex items-center justify-center border-x border-b border-slate-800/50">
                <div className="w-2.5 h-2.5 bg-sky-950 rounded-full border border-slate-800 mr-2.5 shadow-inner"></div>
                <div className="w-9 h-1 bg-slate-800 rounded-full"></div>
              </div>
              <div className="flex items-center space-x-1.5">
                <Wifi className="w-3.5 h-3.5 text-slate-400" />
                <Battery className="w-4.5 h-4.5 text-emerald-400" />
              </div>
            </div>

            {/* SCREEN CONTAINER: AUTHENTICATION (LOGIN / REGISTRATION) */}
            {!loggedInEmployee ? (
              <div className="flex-1 flex flex-col justify-center px-1.5 py-4 space-y-6">
                {/* Visual Logo Indicator */}
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 shadow-inner">
                    <Fingerprint className="w-9 h-9" />
                  </div>
                  <h2 className="text-lg font-bold tracking-tight">កម្មវិធីវត្តមានបុគ្គលិក</h2>
                  <p className="text-xs text-slate-400">សូមចូលប្រើប្រាស់ ឬចុះឈ្មោះគណនីរបស់អ្នក</p>
                </div>

                {!isRegisterMode ? (
                  // LOGIN FORM
                  <div className="space-y-4">
                    <div className="space-y-2.5">
                      <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                          <IdCard className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          placeholder="អត្តលេខបុគ្គលិក (ឧ. EMP-045)"
                          value={loginId}
                          onChange={(e) => setLoginId(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-3 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono placeholder-slate-500"
                        />
                      </div>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                          <Key className="w-4 h-4" />
                        </span>
                        <input
                          type="password"
                          placeholder="លេខកូដសម្ងាត់បុគ្គលិក"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-3 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-500"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleEmployeeLogin}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white py-3 rounded-xl font-bold text-xs transition duration-150 shadow-lg shadow-emerald-900/30 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <LogIn className="w-4 h-4" />
                      ចូលប្រើប្រាស់ប្រព័ន្ធ
                    </button>

                    <div className="text-center pt-1">
                      <span className="text-xs text-slate-400">មិនទាន់មានគណនីមែនទេ? </span>
                      <button
                        onClick={() => setIsRegisterMode(true)}
                        className="text-xs text-emerald-400 font-bold hover:underline cursor-pointer"
                      >
                        ចុះឈ្មោះគណនីថ្មី
                      </button>
                    </div>

                    {/* Pre-installed account reminders */}
                    <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800 text-[10px] text-slate-400 space-y-1.5">
                      <p className="font-semibold text-emerald-400 flex items-center gap-1 border-b border-white/5 pb-1">
                        <Info className="w-3 h-3" /> គណនីសាកល្បងដែលមានស្រាប់៖
                      </p>
                      <p>• អត្តលេខ៖ <span className="font-mono text-white">EMP-045</span> | លេខសម្ងាត់៖ <span className="font-mono text-white">1234</span></p>
                      <p>• អត្តលេខ៖ <span className="font-mono text-white">EMP-012</span> | លេខសម្ងាត់៖ <span className="font-mono text-white">1234</span></p>
                    </div>
                  </div>
                ) : (
                  // REGISTRATION SIGN-UP FORM
                  <div className="space-y-4">
                    <div className="space-y-2.5 max-h-[385px] overflow-y-auto pr-1" style={{ scrollbarWidth: "none" }}>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">ឈ្មោះពេញបុគ្គលិក *</label>
                        <input
                          type="text"
                          placeholder="ឧ. សុខ វិបុល"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">អត្តលេខបុគ្គលិក *</label>
                          <input
                            type="text"
                            placeholder="ឧ. EMP-101"
                            value={regId}
                            onChange={(e) => setRegId(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">ដេប៉ាតឺម៉ង់/ផ្នែក *</label>
                          <input
                            type="text"
                            placeholder="ឧ. IT / HR / លក់"
                            value={regDept}
                            onChange={(e) => setRegDept(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">តួនាទី *</label>
                          <input
                            type="text"
                            placeholder="ឧ. Developer"
                            value={regPosition}
                            onChange={(e) => setRegPosition(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">លេខកូដសម្ងាត់ *</label>
                          <input
                            type="password"
                            placeholder="កូដសម្ងាត់ផ្ទាល់ខ្លួន"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">រូបតំណាង Avatar</label>
                        <select
                          value={regAvatar}
                          onChange={(e) => setRegAvatar(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="Felix">Felix (បុរសសក់ខ្លី)</option>
                          <option value="Aneka">Aneka (នារីវ៉ែនតា)</option>
                          <option value="Milo">Milo (បុរសវ័យក្មេង)</option>
                          <option value="Bella">Bella (នារីសក់វែង)</option>
                          <option value="Oliver">Oliver (បុរសពុកចង្ការ)</option>
                          <option value="Sophia font-sans">Sophia (នារីសក់រួញ)</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={handleEmployeeRegister}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white py-3 rounded-xl font-bold text-xs transition duration-150 cursor-pointer"
                    >
                      បង្កើតគណនីថ្មី
                    </button>

                    <div className="text-center pt-1">
                      <span className="text-xs text-slate-400">មានគណនីរួចហើយមែនទេ? </span>
                      <button
                        onClick={() => setIsRegisterMode(false)}
                        className="text-xs text-emerald-400 font-bold hover:underline cursor-pointer"
                      >
                        ត្រឡប់ទៅចូលប្រើ
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // APP CONTAINER (VISIBLE ONLY AFTER LOGGED IN)
              <div className="flex-1 flex flex-col justify-between py-1.5 space-y-3.5 px-0.5">
                {/* Employee Profile Banner Row */}
                <div className="border-b border-slate-900 pb-3 flex justify-between items-center bg-slate-950 p-1.5 rounded-2xl">
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${loggedInEmployee.avatar}`}
                      className="w-10 h-10 rounded-full bg-slate-800 border-2 border-emerald-400 p-0.5"
                      alt="Avatar"
                    />
                    <div>
                      <h3 className="text-xs font-bold text-white">{loggedInEmployee.name}</h3>
                      <p className="text-[10px] text-emerald-400 font-medium tracking-tight">
                        {loggedInEmployee.position} • {loggedInEmployee.dept}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleEmployeeLogout}
                    className="bg-slate-900 hover:bg-red-950 hover:text-red-300 text-rose-400 text-[10px] px-2.5 py-2 rounded-xl border border-slate-800 font-medium flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" />
                    ចាកចេញ
                  </button>
                </div>

                {/* Simulated Geofencing Range status */}
                <div className="flex-1 overflow-y-auto space-y-3.5" style={{ scrollbarWidth: "none" }}>
                  <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800/80 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-semibold tracking-wide">ស្ថានភាពទីតាំង (GPS Geofence)</span>
                      {isWithinGeofence ? (
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> នៅក្នុងការិយាល័យ
                        </span>
                      ) : (
                        <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[9px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span> ក្រៅការិយាល័យ
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900">
                        <p className="text-[9px] text-slate-400 font-medium">ចម្ងាយពីការិយាល័យ</p>
                        <p className={`text-xs font-bold mt-0.5 ${isWithinGeofence ? "text-emerald-400" : "text-amber-500"}`}>
                          {calculatedDistance.toLocaleString()} ម៉ែត្រ
                        </p>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900">
                        <p className="text-[9px] text-slate-400 font-medium">ចម្ងាយអនុញ្ញាត</p>
                        <p className="text-xs font-bold text-indigo-300 mt-0.5">{office.radius} ម៉ែត្រ</p>
                      </div>
                    </div>

                    {/* Simulation location buttons */}
                    <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-850 space-y-1.5">
                      <p className="text-[9px] text-emerald-400 font-semibold text-center uppercase tracking-wider">
                        តេស្តប្តូរទីតាំងបុគ្គលិក (Simulation GPS)
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setSimulatedLocation("office")}
                          className={`text-[9.5px] py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            simulatedLocMode === "office"
                              ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
                              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                          }`}
                        >
                          <Building className="w-3 h-3" />
                          នៅការិយាល័យ
                        </button>
                        <button
                          onClick={() => setSimulatedLocation("home")}
                          className={`text-[9.5px] py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            simulatedLocMode === "home"
                              ? "bg-rose-600 text-white shadow-md shadow-rose-950/40"
                              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                          }`}
                        >
                          <Home className="w-3 h-3" />
                          នៅផ្ទះ (ឆ្ងាយ)
                        </button>
                      </div>
                      <div className="pt-1 flex justify-between items-center text-[8.5px] text-slate-500 font-mono px-0.5">
                        <span>Lat: {empLat.toFixed(5)}, Lng: {empLng.toFixed(5)}</span>
                        <button
                          onClick={fetchRealGPS}
                          className="text-emerald-400 hover:underline cursor-pointer flex items-center gap-0.5 font-sans"
                        >
                          <Compass className="w-2.5 h-2.5 animate-spin" style={{ animationDuration: "12s" }} /> យក GPS ពិត
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Scan Selector Tabs */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-900/30 p-1 rounded-2xl border border-slate-900/50">
                    <button
                      onClick={() => setScanMethod("qr")}
                      className={`py-2 px-1 rounded-xl text-[11px] font-bold transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                        scanMethod === "qr" ? "bg-emerald-500 text-white shadow" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <QrCode className="w-4 h-4" />
                      ស្កែន QR Code
                    </button>
                    <button
                      onClick={() => setScanMethod("face")}
                      className={`py-2 px-1 rounded-xl text-[11px] font-bold transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                        scanMethod === "face" ? "bg-emerald-500 text-white shadow" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Fingerprint className="w-4 h-4" />
                      ស្កែនផ្ទៃមុខ (Face)
                    </button>
                  </div>

                  {/* Active Camera viewport Block */}
                  <div className="bg-black rounded-2xl aspect-video relative overflow-hidden border border-slate-900/80 flex items-center justify-center shadow-inner group">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className={`absolute inset-0 w-full h-full object-cover z-10 transition-all ${
                        isRealCameraActive ? "opacity-100" : "opacity-0 pointer-events-none"
                      }`}
                    />

                    {/* Scanning feedback grid layer overlay (always shown) */}
                    <div className="absolute inset-x-6 inset-y-4 border border-dashed border-white/10 rounded-xl z-20 pointer-events-none pointer-events-none flex items-center justify-center" />

                    {/* Simulated laser beam bouncing */}
                    <div className="absolute left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_8px_#10b981] z-20 animate-bounce top-2 bottom-2" style={{ animationDuration: "4s" }} />

                    {/* QR alignment frame */}
                    {scanMethod === "qr" && !isRealCameraActive && (
                      <div className="z-10 text-center p-3 space-y-1">
                        <QrCode className="w-10 h-10 text-emerald-400 animate-pulse mx-auto mb-1.5" />
                        <p className="text-[10px] text-slate-300 font-medium">ស្វែងរកកូដ QR...</p>
                        <p className="text-[9px] text-slate-500 max-w-xs mx-auto">សូមតម្រង់កូដ QR ក្រុមហ៊ុនរបស់អ្នកទៅកាន់កាមេរ៉ា</p>
                      </div>
                    )}

                    {/* Face mapping alignment frame */}
                    {scanMethod === "face" && (
                      <div className="absolute inset-0 z-20 flex flex-col justify-between p-2">
                        <span className="text-[8px] bg-black/50 text-emerald-400 border border-emerald-500/20 py-0.5 px-2 rounded-md self-center font-bold tracking-wider">
                          🧬 ស្គែនផ្ទៃមុខសុវត្ថិភាព (BIO-ID)
                        </span>

                        <div className="relative w-24 h-24 rounded-full border-4 border-dashed border-emerald-400/85 animate-spin self-center flex items-center justify-center mb-1 shadow-md shadow-emerald-500/10" style={{ animationDuration: "14s" }}>
                          <div className="w-16 h-16 rounded-full border-2 border-emerald-400/30"></div>
                        </div>

                        <span className="text-[9px] text-slate-400 text-center font-medium">ស្វែងរកទម្រង់មុខ... ៩៨.៦%</span>
                      </div>
                    )}

                    {/* Top Layer Label status when active */}
                    {isRealCameraActive && (
                      <div className="absolute top-2 left-2 z-20 bg-emerald-500/95 text-white text-[8px] font-bold px-2 py-0.5 rounded shadow">
                        កាមេរ៉ា៖ សកម្ម
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="absolute bottom-2 right-2 z-30">
                      <button
                        onClick={toggleRealCamera}
                        className="bg-black/70 hover:bg-black/90 text-white text-[9.5px] px-2.5 py-1.5 rounded-lg border border-white/10 font-bold transition flex items-center gap-1 cursor-pointer hover:border-emerald-500/40"
                      >
                        <Camera className="w-3 h-3 text-emerald-400" />
                        {isRealCameraActive ? "បិទកាមេរ៉ាពិត" : "បើកកាមេរ៉ាពិត"}
                      </button>
                    </div>
                  </div>

                  {/* Submission triggers */}
                  <div className="bg-slate-900/45 p-2 rounded-2xl border border-slate-900/60 shadow">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => executeAttendance("Check-In")}
                        className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-950/40 cursor-pointer"
                      >
                        <LogIn className="w-4 h-4" />
                        ចូលធ្វើការ (Check-In)
                      </button>
                      <button
                        onClick={() => executeAttendance("Check-Out")}
                        className="bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-rose-950/40 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        ចេញធ្វើការ (Check-Out)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Simulated Phone Bar Home swipe line */}
            <div className="pb-1 pt-3.5 flex justify-center z-10 border-t border-slate-900">
              <div className="w-28 h-1 bg-slate-800 rounded-full"></div>
            </div>
          </div>
        </section>

        {/* ======================================== */}
        {/* RIGHT COMPONENT: ADMIN PORTAL PANEL */}
        {/* ======================================== */}
        <section
          className={`lg:col-span-7 space-y-6 ${
            activePortalTab !== "admin" ? "hidden lg:block font-sans" : ""
          }`}
        >
          {/* DIALOG 1: ADMIN NOT LOGGED IN OVERLAY SCREEN */}
          {!isAdminAuthenticated ? (
            <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-slate-200 text-center space-y-7">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto text-indigo-600 border border-indigo-100 shadow-sm">
                <Shield className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">ផ្ទាំងគ្រប់គ្រងត្រូវបានចាក់សោ (Admin Only)</h2>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  សូមបញ្ចូលលេខកូដសម្ងាត់អ្នកគ្រប់គ្រងដើម្បីចូលទៅកាន់ផ្ទាំងគ្រប់គ្រងវត្តមានបុគ្គលិក និងការកំណត់ទីតាំងរបស់ក្រុមហ៊ុន។
                </p>
              </div>

              <form onSubmit={handleAdminAuth} className="max-w-xs mx-auto space-y-4">
                <div className="relative">
                  <input
                    type={showAdminPasscode ? "text" : "password"}
                    placeholder="បញ្ចូលលេខកូដសម្ងាត់..."
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPasscode((p) => !p)}
                    className="absolute inset-y-0 right-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                  >
                    {showAdminPasscode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-905 bg-indigo-950 hover:bg-slate-900 active:bg-black text-white font-semibold py-3.5 rounded-2xl transition duration-150 shadow-md shadow-indigo-950/10 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Key className="w-4 h-4 text-emerald-400" />
                  ផ្ទៀងផ្ទាត់ និងចូលប្រព័ន្ធ
                </button>

                <div className="text-[10.5px] text-amber-600 font-semibold bg-amber-50 rounded-xl py-2 px-3 border border-amber-100 flex items-center justify-center gap-1">
                  <Info className="w-3.5 h-3.5 flex-shrink-0" />
                  តម្រុយ៖ លេខកូដសម្ងាត់ Admin គឺ <span className="font-mono text-xs text-slate-900 bg-white/60 px-1.5 py-0.5 rounded border border-slate-200">22334455</span>
                </div>
              </form>
            </div>
          ) : (
            // ACTIVE INTEGRATED ADMIN PANEL
            <div className="space-y-6">
              {/* Header admin signpost */}
              <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                <div className="flex items-center space-x-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-xs font-bold text-indigo-950">គណនីអ្នកគ្រប់គ្រង (Admin Mode): សកម្ម</span>
                </div>
                <button
                  onClick={handleAdminLogout}
                  className="bg-rose-100 hover:bg-rose-200 active:bg-rose-300 text-rose-700 text-xs px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  ចាកចេញ (Lock)
                </button>
              </div>

              {/* Attendance quick statistics counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/60 flex items-center justify-between">
                  <div>
                    <p class="text-xs text-slate-400 font-semibold">វត្តមានសរុប</p>
                    <p className="text-xl font-bold text-indigo-950 mt-1">{statTotal}</p>
                  </div>
                  <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/60 flex items-center justify-between">
                  <div>
                    <p class="text-xs text-slate-400 font-semibold">ចូលទាន់ម៉ោង</p>
                    <p className="text-xl font-bold text-emerald-600 mt-1">{statOnTime}</p>
                  </div>
                  <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-500">
                    <UserCheck className="w-5 h-5" />
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/60 flex items-center justify-between">
                  <div>
                    <p class="text-xs text-slate-400 font-semibold">យឺតយ៉ាវ</p>
                    <p className="text-xl font-bold text-amber-500 mt-1">{statLate}</p>
                  </div>
                  <div className="bg-amber-50 p-2.5 rounded-xl text-amber-500">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/60 flex items-center justify-between">
                  <div>
                    <p class="text-xs text-slate-400 font-semibold">អវត្តមាន (Demo)</p>
                    <p className="text-xl font-bold text-rose-500 mt-1">{statAbsent}</p>
                  </div>
                  <div className="bg-rose-50 p-2.5 rounded-xl text-rose-500">
                    <UserX className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Double card split row: Settings and Telegram Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Geofence parameters setting */}
                <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/60 space-y-4">
                  <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                    <h2 className="font-bold text-slate-800 text-sm">កំណត់ទីតាំងការិយាល័យ & ចម្ងាយ</h2>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] text-slate-400 font-semibold mb-1">កូអរដោនេការិយាល័យ (Lat, Lng)</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          step="0.000001"
                          value={office.lat}
                          onChange={(e) => updateOfficeCoord("lat", parseFloat(e.target.value) || 0)}
                          className="bg-slate-50 border border-slate-200 rounded px-2.5 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-550 font-mono"
                        />
                        <input
                          type="number"
                          step="0.000001"
                          value={office.lng}
                          onChange={(e) => updateOfficeCoord("lng", parseFloat(e.target.value) || 0)}
                          className="bg-slate-50 border border-slate-200 rounded px-2.5 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-550 font-mono"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 font-semibold mb-1">រង្វង់អនុញ្ញាត (ម៉ែត្រ)</label>
                        <input
                          type="number"
                          value={office.radius}
                          onChange={(e) => updateOfficeCoord("radius", parseInt(e.target.value) || 0)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-550"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 font-semibold mb-1">ម៉ោងចូលបំពេញការងារ</label>
                        <input
                          type="time"
                          value={office.inTime}
                          onChange={(e) => updateOfficeCoord("inTime", e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-550 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={setOfficeToCurrentLocation}
                      className="w-full bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-700 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      យកទីតាំងបច្ចុប្បន្នរបស់ខ្ញុំជាគោល
                    </button>
                  </div>
                </div>

                {/* Telegram notifications configure */}
                <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/60 space-y-4">
                  <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
                    <Send className="w-5 h-5 text-sky-500" />
                    <h2 className="font-bold text-slate-800 text-sm">ភ្ជាប់ទំនាក់ទំនង Telegram Bot (Real-time)</h2>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 font-semibold mb-1">Telegram Bot Token</label>
                      <input
                        type="text"
                        placeholder="ឧ. 71928372:AAElk..."
                        value={telegramToken}
                        onChange={(e) => setTelegramToken(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 font-semibold mb-1">Chat ID / Group ID</label>
                      <input
                        type="text"
                        placeholder="ឧ. -100482937"
                        value={telegramChatId}
                        onChange={(e) => setTelegramChatId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={handleTestTelegramMessage}
                      className="w-full bg-sky-50 hover:bg-sky-100 active:bg-sky-200 text-sky-700 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      ផ្ញើសារសាកល្បងទៅ Telegram
                    </button>
                  </div>
                </div>
              </div>

              {/* CARD: EMPLOYEE DIRECTORY */}
              <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/60 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <Plus className="w-5 h-5 text-indigo-655 text-indigo-600" />
                    <h2 className="font-bold text-slate-800 text-sm">គ្រប់គ្រងបញ្ជីឈ្មោះបុគ្គលិកទាំងអស់</h2>
                  </div>
                  <button
                    onClick={() => setIsNewEmpModalOpen(true)}
                    className="bg-indigo-950 hover:bg-slate-900 text-white text-xs px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    បន្ថែមបុគ្គលិកថ្មី
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-60 overflow-y-auto pr-1">
                  {employees.map((emp) => (
                    <div
                      key={emp.id}
                      className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-2xl hover:shadow-xs transition"
                    >
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${emp.avatar}`}
                          className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300"
                          alt="Avatar"
                        />
                        <div>
                          <p className="font-bold text-xs text-slate-800 leading-tight">{emp.name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {emp.position} • <span className="font-semibold text-indigo-700">{emp.dept}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-mono font-bold bg-slate-200/80 px-2.5 py-0.5 rounded-md text-slate-600">
                          {emp.id}
                        </p>
                        <p className="text-[9px] text-slate-400 mt-1 font-mono">P: {emp.password}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CARD: ATTENDANCE Daily LOGS */}
              <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/60 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 border-b border-slate-100 pb-4">
                  <div className="flex items-center space-x-2.5">
                    <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-800 text-sm">កំណត់ត្រាវត្តមានបុគ្គលិកប្រចាំថ្ងៃ</h2>
                      <p className="text-[10px] text-slate-400">ទិន្នន័យត្រូវបានធ្វើបច្ចុប្បន្នភាពភ្លាមៗ</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setIsMonthlyReportModalOpen(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-indigo-500/10 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      របាយការណ៍ប្រចាំខែ (PDF)
                    </button>
                    <button
                      onClick={handleExportToExcel}
                      className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-500/10 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      ទាញចេញជា Excel (.xlsx)
                    </button>
                    <button
                      onClick={handleClearLogs}
                      className="bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600 text-xs px-4 py-2.5 rounded-xl font-bold transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      សម្អាតទិន្នន័យ
                    </button>
                  </div>
                </div>

                {/* Table block */}
                <div className="overflow-x-auto rounded-2xl border border-slate-200/60">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-150">
                        <th className="p-3">បុគ្គលិក</th>
                        <th className="p-3">ប្រភេទស្កែន</th>
                        <th className="p-3">ប្រភេទវត្តមាន</th>
                        <th className="p-3">កាលបរិច្ឆេទ & ម៉ោង</th>
                        <th className="p-3">ចម្ងាយ (ម៉ែត្រ)</th>
                        <th className="p-3">ស្ថានភាព</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {logs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-10 text-center text-slate-400 font-medium">
                            <Info className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                            មិនទាន់មានកំណត់ត្រាវត្តមានសម្រាប់ថ្ងៃនេះទេ
                          </td>
                        </tr>
                      ) : (
                        logs.map((log, index) => {
                          const isLate = log.status === "យឺតយ៉ាវ";
                          const isCheckIn = log.type === "Check-In";
                          return (
                            <tr key={index} className="hover:bg-slate-50/50 transition">
                              <td className="p-3 font-semibold text-slate-700">
                                {log.name}
                                <span className="block text-[10px] text-slate-400 font-semibold">
                                  {log.dept} ({log.id})
                                </span>
                              </td>
                              <td className="p-3 text-slate-500">{log.scanMethod}</td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10.5px] font-medium border ${
                                    isCheckIn
                                      ? "bg-sky-50 text-sky-700 border-sky-100"
                                      : "bg-indigo-50 text-indigo-700 border-indigo-100"
                                  }`}
                                >
                                  {log.type}
                                </span>
                              </td>
                              <td className="p-3 text-slate-500 font-mono text-[11px]">{log.time}</td>
                              <td className="p-3 text-slate-600 font-semibold">{log.distance}</td>
                              <td className="p-3">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    log.status === "ទាន់ម៉ោង"
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                      : isLate
                                      ? "bg-amber-50 text-amber-700 border border-amber-100"
                                      : "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  {log.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CARD: TELEGRAM TERMINAL VIEW SCREEN */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <Send className="w-5 h-5 text-sky-400" />
                    <div>
                      <h3 className="text-xs font-bold text-slate-200">ប្រអប់ត្រួតពិនិត្យសារ Telegram (Bot Terminal)</h3>
                      <p className="text-[9px] text-slate-400">បង្ហាញសារដែលបានផ្ញើទៅកាន់ថ្នាក់ដឹកនាំ</p>
                    </div>
                  </div>
                  <span className="text-[9px] bg-slate-800 px-2.5 py-0.5 rounded-md text-sky-400 font-bold font-mono">
                    LIVE LOGGER
                  </span>
                </div>

                <div
                  className="h-32 bg-slate-950 rounded-lg p-3 overflow-y-auto font-mono text-[11px] text-slate-300 space-y-1.5"
                  style={{ scrollbarWidth: "thin" }}
                >
                  {telegramLogs.map((logLine, index) => {
                    const isComment = logLine.includes("//");
                    const isSuccess = logLine.includes("✅");
                    const isError = logLine.includes("❌");
                    return (
                      <div
                        key={index}
                        className={`whitespace-pre-wrap leading-tight ${
                          isComment
                            ? "text-slate-500"
                            : isSuccess
                            ? "text-emerald-400 font-semibold"
                            : isError
                            ? "text-rose-400"
                            : "text-sky-200"
                        }`}
                      >
                        {logLine}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* --- EXTRA DIALOG OVERLAY: CREATE NEW EMPLOYEE (ADMIN DIALOG) --- */}
      <AnimatePresence>
        {isNewEmpModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewEmpModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative z-10 border border-slate-100"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-1.5">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  បង្កើតគណនីបុគ្គលិកថ្មី
                </h3>
                <button
                  type="button"
                  onClick={() => setIsNewEmpModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateEmployeeSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">ឈ្មោះបុគ្គលិក *</label>
                    <input
                      type="text"
                      required
                      placeholder="ឧ. កែវ សំណាង"
                      value={newEmpName}
                      onChange={(e) => setNewEmpName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">អត្តលេខបុគ្គលិក *</label>
                    <input
                      type="text"
                      required
                      placeholder="ឧ. EMP-088"
                      value={newEmpId}
                      onChange={(e) => setNewEmpId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">ផ្នែក/ដេប៉ាតឺម៉ង់ *</label>
                    <input
                      type="text"
                      required
                      placeholder="ឧ. គណនេយ្យ"
                      value={newEmpDept}
                      onChange={(e) => setNewEmpDept(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">តួនាទីការងារ *</label>
                    <input
                      type="text"
                      required
                      placeholder="ឧ. Senior Accountant"
                      value={newEmpPosition}
                      onChange={(e) => setNewEmpPosition(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">លេខកូដសម្ងាត់ *</label>
                    <input
                      type="password"
                      required
                      placeholder="លេខសម្ងាត់សម្រាប់ឡុកចូល"
                      value={newEmpPassword}
                      onChange={(e) => setNewEmpPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">រូបតំណាង Avatar</label>
                    <select
                      value={newEmpAvatar}
                      onChange={(e) => setNewEmpAvatar(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="Felix">Felix (បុរសសក់ខ្លី)</option>
                      <option value="Aneka">Aneka (នារីវ៉ែនតា)</option>
                      <option value="Milo">Milo (បុរសវ័យក្មេង)</option>
                      <option value="Bella">Bella (នារីសក់វែង)</option>
                      <option value="Oliver">Oliver (បុរសពុកចង្ការ)</option>
                      <option value="Sophia font-sans">Sophia (នារីសក់រួញ)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsNewEmpModalOpen(false)}
                    className="bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600 text-xs px-4.5 py-2.5 rounded-xl font-bold transition duration-150 cursor-pointer"
                  >
                    បោះបង់
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-950 hover:bg-slate-900 text-white text-xs px-4.5 py-2.5 rounded-xl font-bold transition duration-150 flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    រក្សាទុកបុគ្គលិក
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* --- EXTRA DIALOG OVERLAY: GENERATE MONTHLY REPORT (ADMIN DIALOG) --- */}
      <AnimatePresence>
        {isMonthlyReportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMonthlyReportModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative z-10 border border-slate-100 flex flex-col max-h-[85vh]"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3.5">
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  ម៉ាស៊ីនបង្កើតរបាយការណ៍វត្តមានប្រចាំខែ
                </h3>
                <button
                  type="button"
                  onClick={() => setIsMonthlyReportModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filtering Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-150">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500">ជ្រើសរើសខែរបាយការណ៍</label>
                  <select
                    value={selectedReportMonth}
                    onChange={(e) => setSelectedReportMonth(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {getAvailableMonths().map((m) => {
                      const d = new Date(`${m}-02`);
                      const formattedKhMonth = d.toLocaleString("km-KH", { month: "long" }) + " " + d.getFullYear();
                      return (
                        <option key={m} value={m}>
                          {m} ({formattedKhMonth})
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="flex items-end justify-end">
                  <button
                    onClick={handleGenerateMonthlyReportPDF}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-5 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-md shadow-indigo-500/10 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    ទាញយករបាយការណ៍ជា PDF
                  </button>
                </div>
              </div>

              {/* Mini Stats block */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 text-center">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">កំណត់ត្រាសរុប</p>
                  <p className="text-sm font-bold text-slate-800 mt-1">{filteredMonthlyLogs.length} ជួរ</p>
                </div>
                <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 text-center">
                  <p className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">ទាន់ម៉ោង</p>
                  <p className="text-sm font-bold text-emerald-600 mt-1">{monthlyOnTime} នាក់</p>
                </div>
                <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100 text-center">
                  <p className="text-[10px] text-amber-600 font-semibold uppercase tracking-wider">យឺតយ៉ាវ</p>
                  <p className="text-sm font-bold text-amber-600 mt-1">{monthlyLate} នាក់</p>
                </div>
              </div>

              {/* Data Table Preview Row */}
              <div className="flex-1 overflow-y-auto space-y-2 rounded-2xl border border-slate-100 min-h-[180px] p-1 bg-slate-50/50">
                {filteredMonthlyLogs.length === 0 ? (
                  <div className="h-full flex flex-col justify-center items-center p-8 space-y-1.5">
                    <AlertTriangle className="w-8 h-8 text-slate-300" />
                    <p className="text-xs text-slate-400 font-medium">មិនមានទិន្នន័យវត្តមានសម្រាប់ខែ {selectedReportMonth} ទេ</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-slate-100/80 text-slate-500 font-semibold border-b border-slate-250">
                          <th className="p-2.5">អត្តលេខ</th>
                          <th className="p-2.5">ឈ្មោះបុគ្គលិក</th>
                          <th className="p-2.5">ផ្នែក</th>
                          <th className="p-2.5">ប្រភេទ</th>
                          <th className="p-2.5">ម៉ោងស្កែន</th>
                          <th className="p-2.5 text-right">ស្ថានភាព</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredMonthlyLogs.map((log, index) => (
                          <tr key={log.id + "-" + log.time + "-" + index} className="hover:bg-slate-100/50">
                            <td className="p-2.5 font-mono text-slate-500">{log.id}</td>
                            <td className="p-2.5 font-medium text-slate-700">{log.name}</td>
                            <td className="p-2.5 text-slate-500">{log.dept}</td>
                            <td className="p-2.5">
                              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium ${
                                log.type === "Check-In" ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-600"
                              }`}>
                                {log.type}
                              </span>
                            </td>
                            <td className="p-2.5 font-mono text-slate-500">{log.time}</td>
                            <td className="p-2.5 text-right font-semibold">
                              <span className={
                                log.status === "ទាន់ម៉ោង" ? "text-emerald-500" : log.status === "យឺតយ៉ាវ" ? "text-amber-500" : "text-slate-500"
                              }>
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Close Footer Row */}
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsMonthlyReportModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600 text-xs px-5 py-2.5 rounded-xl font-bold transition duration-150 cursor-pointer"
                >
                  បិទវីនដូ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- GLOBAL CUSTOM MODAL ALERT DIALOGS --- */}
      <CustomDialog
        isOpen={dialogOpen}
        type={dialogType}
        title={dialogTitle}
        message={dialogMessage}
        onClose={() => setDialogOpen(false)}
      />

      {/* --- FOOTER CREDITS BAR --- */}
      <footer className="bg-white border-t border-slate-200 text-center py-4 text-xs text-slate-400 font-medium">
        <p>© ២០២៦ រក្សាសិទ្ធគ្រប់យ៉ាងដោយប្រព័ន្ធវត្តមានឆ្លាតវៃ (Smart Attendance System)</p>
      </footer>
    </div>
  );
}
