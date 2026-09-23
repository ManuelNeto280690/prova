import { IconChart, IconClock, IconEdit, IconExam, IconEye, IconPlus, IconTrash } from '@/Components/ui/Icons';
import { container, item } from '@/Components/ui/Reveal';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function ExamsIndex({ exams }) {
    const togglePublish = (exam) => {
        router.post(route('admin.exams.publish', exam.id), {}, { preserveScroll: true });
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
                <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2">
                    {exams.map((e) => (
                        <motion.div key={e.id} variants={item} className="glass flex flex-col p-6">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h3 className="truncate text-lg font-semibold text-white">{e.title}</h3>
                                    <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                                        {e.description || 'Sem descrição.'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => togglePublish(e)}
                                    className={`chip shrink-0 border ${
                                        e.is_published
                                            ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300'
                                            : 'border-slate-500/30 bg-slate-500/10 text-slate-400'
                                    }`}
                                >
                                    <span className={`h-1.5 w-1.5 rounded-full ${e.is_published ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                                    {e.is_published ? 'Publicada' : 'Rascunho'}
                                </button>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-400">
                                <span className="flex items-center gap-1.5"><IconExam className="h-4 w-4" /> {e.questions_count} questões</span>
                                <span className="flex items-center gap-1.5"><IconClock className="h-4 w-4" /> {e.duration_minutes} min</span>
                                <span className="flex items-center gap-1.5"><IconChart className="h-4 w-4" /> {e.finished_attempts} realizadas</span>
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
                    ))}
                </motion.div>
            )}
        </AdminLayout>
    );
}
