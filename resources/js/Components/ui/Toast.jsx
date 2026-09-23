import { usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { IconCheck } from './Icons';

/** Listens to `flash.message` and shows a transient success toast. */
export default function Toast() {
    const { flash } = usePage().props;
    const [msg, setMsg] = useState(null);

    useEffect(() => {
        if (flash?.message) {
            setMsg(flash.message);
            const t = setTimeout(() => setMsg(null), 4000);
            return () => clearTimeout(t);
        }
    }, [flash?.message]);

    return (
        <div className="pointer-events-none fixed bottom-6 right-6 z-[60]">
            <AnimatePresence>
                {msg && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="pointer-events-auto flex items-center gap-3 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-200 backdrop-blur-xl shadow-card"
                    >
                        <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500/20 text-emerald-300">
                            <IconCheck className="h-4 w-4" />
                        </span>
                        {msg}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
