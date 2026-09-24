import { IconAlert, IconChart, IconClock, IconEdit, IconExam, IconEye, IconPlus, IconShield, IconTrash } from '@/Components/ui/Icons';
import { container, item } from '@/Components/ui/Reveal';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

function fmt(s) {
    if (s <= 0) return '00:00';
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export default function ExamsIndex({ exams }) {
    // Keep a local ticking clock for active exams
    const [timers, setTimers] = useState(() => {
        const map = {};
        exams.forEach((e) => {
            if (e.is_active && e.seconds_remaining) {
                map[e.id] = e.seconds_remaining;
            }
        });
        return map;
    });

    useEffect(() => {
        const id = setInterval(() => {
            setTimers((prev) => {
                const next = { ...prev };
                Object.keys(next).forEach((k) => {
                    if (next[k] > 0) next[k] -= 1;
                });
                return next;
            });
        }, 1000);
        return () => clearInterval(id);
    }, []);

    const togglePublish = (exam) => {
        router.post(route('admin.exams.publish', exam.id), {}, { preserveScroll: true });
    };

    const activate = (exam) => {
        if (confirm(`Deseja ativar a prova "${exam.title}" agora?\n\nA prova ficará visível imediatamente para todos os alunos e a contagem regressiva de ${exam.duration_minutes} minutos começará simultaneamente.`)) {
            router.post(route('admin.exams.activate', exam.id), {}, { preserveScroll: true });
        }
    };

    const closeExam = (exam) => {
        if (confirm(`Deseja encerrar a prova "${exam.title}" agora?\n\nOs alunos que estão realizando a prova terão suas respostas salvas e não serão permitidos novos acessos.`)) {
            router.post(route('admin.exams.close', exam.id), {}, { preserveScroll: true });
        }
    };

    const resetActivation = (exam) => {
        if (confirm(`Deseja reiniciar a ativação da prova "${exam.title}"?\n\nO cronômetro voltará ao início e a prova ficará aguardando uma nova ativação.`)) {
            router.post(route('admin.exams.resetActivation', exam.id), {}, { preserveScroll: true });
        }
    };

    const remove = (exam) => {
        if (confirm(`Remover a prova "${exam.title}"? Todas as tentativas e resultados serão apagados.`)) {
            router.delete(route('admin.exams.destroy', exam.id), { preserveScroll: true });
        }
    };

    return (
        <AdminLayout
            title="Provas"
            actions={
                <Link href={route('admin.exams.create')} className="btn-primary">
                    <IconPlus className="h-4 w-4" />
                    Nova prova
                </Link>
            }
        >
            <Head title="Provas — Admin" />

            {exams.length === 0 ? (
                <div className="glass flex flex-col items-center gap-4 px-6 py-16 text-center">
                    <IconExam className="h-10 w-10 text-slate-600" />
                    <div>
                        <p className="font-medium text-white">Nenhuma prova criada</p>
                        <p className="mt-1 text-sm text-slate-500">Crie sua primeira prova de múltipla escolha.</p>
                    </div>
                    <Link href={route('admin.exams.create')} className="btn-primary">
                        <IconPlus className="h-4 w-4" /> Criar prova
                    </Link>
                </div>
            ) : (
                <motion.div variants={container} initial="hidden" animate="show" className="grid gap-5 md:grid-cols-2">
                    {exams.map((e) => {
                        const remaining = timers[e.id] ?? e.seconds_remaining ?? 0;
                        const isLive = e.is_active && remaining > 0 && !e.is_expired;
                        const isEnded = (e.activated_at && !e.is_active) || e.is_expired || (e.activated_at && remaining <= 0);
                        const isWaiting = e.is_published && !e.activated_at && !e.is_active;

                        return (
                            <motion.div key={e.id} variants={item} className="glass flex flex-col p-6 relative overflow-hidden">
                                {isLive && (
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 animate-pulse" />
                                )}

                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h3 className="truncate text-lg font-semibold text-white">{e.title}</h3>
                                        <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                                            {e.description || 'Sem descrição.'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => togglePublish(e)}
                                            className={`chip border ${
                                                e.is_published
                                                    ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300'
                                                    : 'border-slate-500/30 bg-slate-500/10 text-slate-400'
                                            }`}
                                        >
                                            <span className={`h-1.5 w-1.5 rounded-full ${e.is_published ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                                            {e.is_published ? 'Publicada' : 'Rascunho'}
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-400">
                                    <span className="flex items-center gap-1.5"><IconExam className="h-4 w-4" /> {e.questions_count} questões</span>
                                    <span className="flex items-center gap-1.5"><IconClock className="h-4 w-4" /> {e.duration_minutes} min</span>
                                    <span className="flex items-center gap-1.5"><IconChart className="h-4 w-4" /> {e.finished_attempts} realizadas</span>
                                </div>

                                {/* Control Panel Banner for Teacher */}
                                <div className="mt-4 rounded-xl border p-3.5 text-sm transition-all">
                                    {isLive ? (
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-emerald-500/30 bg-emerald-500/10 text-emerald-200">
                                            <div className="flex items-center gap-2.5">
                                                <span className="relative flex h-3 w-3">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                                </span>
                                                <div>
                                                    <p className="font-bold text-white text-xs uppercase tracking-wider">Ao Vivo • Prova Ativa</p>
                                                    <p className="font-mono text-base font-bold text-emerald-300">Tempo restante: {fmt(remaining)}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => closeExam(e)}
                                                className="btn-danger py-1.5 px-3 text-xs shrink-0"
                                            >
                                                ⏹️ Encerrar Prova
                                            </button>
                                        </div>
                                    ) : isEnded ? (
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-slate-500/20 bg-slate-800/40 text-slate-300">
                                            <div>
                                                <p className="font-semibold text-xs text-slate-400 uppercase tracking-wider">Status da Prova</p>
                                                <p className="text-sm font-medium text-slate-200">Prova Encerrada</p>
                                            </div>
                                            <button
                                                onClick={() => resetActivation(e)}
                                                className="btn-ghost py-1.5 px-3 text-xs border border-white/10 shrink-0 text-slate-300 hover:text-white"
                                            >
                                                🔄 Liberar Nova Ativação
                                            </button>
                                        </div>
                                    ) : isWaiting ? (
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-amber-500/25 bg-amber-500/10 text-amber-200">
                                            <div>
                                                <p className="font-semibold text-xs text-amber-300 uppercase tracking-wider">Aguardando seu comando</p>
                                                <p className="text-xs text-slate-300">Os alunos estão prontos aguardando você iniciar.</p>
                                            </div>
                                            <button
                                                onClick={() => activate(e)}
                                                className="btn-primary py-2 px-3 text-xs shrink-0 font-semibold bg-emerald-600 hover:bg-emerald-500 shadow-glow"
                                            >
                                                ▶️ Ativar Prova Agora
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-xs text-slate-400">
                                            💡 Publique a prova para poder ativá-la para os alunos.
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 flex items-center gap-2 border-t border-white/5 pt-4">
                                    <Link href={route('admin.exams.results', e.id)} className="btn-ghost flex-1">
                                        <IconEye className="h-4 w-4" /> Resultados
                                    </Link>
                                    <Link href={route('admin.exams.edit', e.id)} className="btn-ghost">
                                        <IconEdit className="h-4 w-4" />
                                    </Link>
                                    <button onClick={() => remove(e)} className="btn-danger">
                                        <IconTrash className="h-4 w-4" />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}
        </AdminLayout>
    );
}
