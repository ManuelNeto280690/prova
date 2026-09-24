import { usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { IconAlert, IconCheck } from './Icons';

/** Listens to `flash.message` (success) and `flash.warning` (warning). */
export default function Toast() {
    const { flash } = usePage().props;
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (flash?.message) {
            setToast({ type: 'success', text: flash.message });
        } else if (flash?.warning) {
            setToast({ type: 'warning', text: flash.warning });
        } else {
            return;
        }
        const t = setTimeout(() => setToast(null), 5000);
        return () => clearTimeout(t);
    }, [flash?.message, flash?.warning]);

    const styles = {
        success: {
            wrap: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200',
            icon: 'bg-emerald-500/20 text-emerald-300',
            Icon: IconCheck,
        },
        warning: {
            wrap: 'border-amber-400/30 bg-amber-500/10 text-amber-200',
            icon: 'bg-amber-500/20 text-amber-300',
            Icon: IconAlert,
        },
    };

    const s = toast ? styles[toast.type] : null;

    return (
        <div className="pointer-events-none fixed bottom-6 right-6 z-[60] max-w-sm">
            <AnimatePresence>
                {toast && s && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className={`pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium backdrop-blur-xl shadow-card ${s.wrap}`}
                    >
                        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${s.icon}`}>
                            <s.Icon className="h-4 w-4" />
                        </span>
                        {toast.text}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
