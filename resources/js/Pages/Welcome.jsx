import { IconArrow, IconClock, IconExam, IconShield } from '@/Components/ui/Icons';
import Reveal from '@/Components/ui/Reveal';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

const features = [
    {
        icon: IconShield,
        title: 'Acesso controlado',
        desc: 'Somente alunos cadastrados pelo administrador entram. Área administrativa isolada e protegida.',
    },
    {
        icon: IconClock,
        title: 'Tempo cronometrado',
        desc: 'Cada prova tem duração definida pelo admin. O tempo é validado no servidor — impossível burlar.',
    },
    {
        icon: IconExam,
        title: 'Tentativa única',
        desc: 'Sistema de múltipla escolha. Ao concluir, a prova é encerrada e não pode ser refeita.',
    },
];

export default function Welcome({ canLogin }) {
    return (
        <>
            <Head title="Plataforma de Provas" />
            <div className="relative min-h-screen overflow-hidden">
                <div className="absolute inset-0 grid-bg opacity-40" />
                <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-600/30 blur-[120px]" />

                <div className="relative mx-auto flex max-w-6xl flex-col px-6 py-6">
                    {/* Nav */}
                    <header className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow">
                                <IconShield className="h-5 w-5" />
                            </div>
                            <span className="text-lg font-bold tracking-tight text-white">ProvaSegura</span>
                        </div>
                        {canLogin && (
                            <Link href={route('login')} className="btn-ghost">
                                Entrar
                                <IconArrow className="h-4 w-4" />
                            </Link>
                        )}
                    </header>

                    {/* Hero */}
                    <section className="flex flex-col items-center py-24 text-center sm:py-32">
                        <Reveal>
                            <span className="chip border border-brand-400/30 bg-brand-500/10 text-brand-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-brand-300" />
                                Ambiente seguro de avaliação online
                            </span>
                        </Reveal>

                        <Reveal delay={0.08}>
                            <h1 className="mt-6 max-w-3xl bg-gradient-to-b from-white to-slate-400 bg-clip-text text-4xl font-extrabold leading-[1.1] tracking-tight text-transparent sm:text-6xl">
                                Provas online com segurança de nível profissional
                            </h1>
                        </Reveal>

                        <Reveal delay={0.16}>
                            <p className="mt-6 max-w-xl text-lg text-slate-400">
                                Plataforma de avaliação com múltipla escolha, tempo cronometrado,
                                tentativa única e controle total do administrador.
                            </p>
                        </Reveal>

                        {canLogin && (
                            <Reveal delay={0.24}>
                                <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
                                    <Link href={route('login')} className="btn-primary px-6 py-3 text-base">
                                        Acessar plataforma
                                        <IconArrow className="h-5 w-5" />
                                    </Link>
                                </div>
                            </Reveal>
                        )}
                    </section>

                    {/* Features */}
                    <section className="grid gap-5 pb-24 sm:grid-cols-3">
                        {features.map((f, i) => (
                            <Reveal key={f.title} delay={0.1 * i}>
                                <motion.div
                                    whileHover={{ y: -4 }}
                                    className="glass h-full p-6"
                                >
                                    <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
                                        <f.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white">{f.title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.desc}</p>
                                </motion.div>
                            </Reveal>
                        ))}
                    </section>
                </div>
            </div>
        </>
    );
}
