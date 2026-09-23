import { motion } from 'framer-motion';

/** Fade + rise reveal, with optional stagger index. */
export default function Reveal({ children, delay = 0, className = '', y = 16 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
};

export const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};
