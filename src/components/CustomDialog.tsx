import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

interface CustomDialogProps {
  isOpen: boolean;
  type: "success" | "error" | "warning";
  title: string;
  message: string;
  onClose: () => void;
}

export const CustomDialog: React.FC<CustomDialogProps> = ({
  isOpen,
  type,
  title,
  message,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 15, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative z-10 border border-slate-100 flex flex-col items-center text-center"
          >
            {/* Close button top right */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition p-1 rounded-full hover:bg-slate-50"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon representation */}
            <div className="mb-4">
              {type === "success" && (
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              )}
              {type === "error" && (
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-rose-50 text-rose-600 border border-rose-100">
                  <AlertTriangle className="w-8 h-8" />
                </div>
              )}
              {type === "warning" && (
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-amber-50 text-amber-600 border border-amber-100">
                  <Info className="w-8 h-8" />
                </div>
              )}
            </div>

            {/* Title & Message */}
            <h3 className="font-bold text-slate-800 text-lg mb-2 font-sans tracking-tight">
              {title}
            </h3>
            <p className="text-sm text-slate-500 whitespace-pre-line leading-relaxed mb-6 px-1">
              {message}
            </p>

            {/* Accept Button */}
            <button
              onClick={onClose}
              className="w-full bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-medium py-3 rounded-2xl text-sm transition duration-150 shadow-md shadow-slate-900/10 cursor-pointer"
            >
              យល់ព្រម (OK)
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
