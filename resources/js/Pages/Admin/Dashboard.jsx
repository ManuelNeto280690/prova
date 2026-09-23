import { IconChart, IconCheck, IconExam, IconUsers } from '@/Components/ui/Icons';
import { container, item } from '@/Components/ui/Reveal';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';

const statusChip = {
    completed: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300',
    expired: 'border-amber-400/30 bg-amber-500/10 text-amber-300',
};
const statusLabel = { completed: 'Concluída', expired: 'Tempo esgotado' };

export default function Dashboard({ stats, recentAttempts }) {
    const cards = [
        { label: 'Alunos', value: stats.students, icon: IconUsers, tint: 'text-sky-300 bg-sky-500/15' },
        { label: 'Provas criadas', value: stats.exams, icon: IconExam, tint: 'text-brand-300 bg-brand-500/15' },
        { label: 'Publicadas', value: stats.published, icon: IconCheck, tint: 'text-emerald-300 bg-emerald-500/15' },
        { label: 'Provas realizadas', value: stats.attempts, icon: IconChart, tint: 'text-amber-300 bg-amber-500/15' },
    ];

    return (
        <AdminLayout title="Painel">
            <Head title="Painel — Admin" />

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
                {cards.map((c) => (
                    <motion.div key={c.label} variants={item} className="glass p-5">
                        <div className={`mb-4 grid h-11 w-11 place-items-center rounded-xl ${c.tint}`}>
                            <c.icon className="h-6 w-6" />
                        </div>
                        <p className="text-3xl font-bold tracking-tight text-white">{c.value}</p>
                        <p className="mt-1 text-sm text-slate-400">{c.label}</p>
                    </motion.div>
                ))}
            </motion.div>

            <div className="glass mt-8 overflow-hidden">
                <div className="border-b border-white/10 px-6 py-4">
                    <h2 className="font-semibold text-white">Resultados recentes</h2>
                </div>
                {recentAttempts.length === 0 ? (
                    <p className="px-6 py-10 text-center text-sm text-slate-500">
                        Nenhuma prova concluída ainda.
                    </p>
                ) : (
                    <div className="divide-y divide-white/5">
                        {recentAttempts.map((a) => (
                            <div key={a.id} className="flex items-center justify-between px-6 py-4">
                                <div>
                                    <p className="font-medium text-white">{a.student}</p>
                                    <p className="text-sm text-slate-500">{a.exam} · {a.finished_at}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`chip border ${statusChip[a.status]}`}>{statusLabel[a.status]}</span>
                                    <span className="text-lg font-bold text-white">{a.score}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
