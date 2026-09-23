import { IconChart, IconDashboard, IconExam, IconLogout, IconShield, IconUsers } from '@/Components/ui/Icons';
import Toast from '@/Components/ui/Toast';
import { Link, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';

const nav = [
    { name: 'Painel', href: 'admin.dashboard', icon: IconDashboard, match: '/admin' },
    { name: 'Alunos', href: 'admin.students.index', icon: IconUsers, match: '/admin/alunos' },
    { name: 'Provas', href: 'admin.exams.index', icon: IconExam, match: '/admin/provas' },
];

function isActive(match, current) {
    if (match === '/admin') return current === '/admin' || current === '/admin/';
    return current.startsWith(match);
}

export default function AdminLayout({ title, actions, children }) {
    const { auth, url } = usePage().props;
    const current = usePage().url;

    return (
        <div className="min-h-screen lg:flex">
            {/* Sidebar */}
            <aside className="sticky top-0 z-30 hidden h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-ink-900/70 backdrop-blur-xl lg:flex">
                <div className="flex items-center gap-3 px-6 py-6">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow">
                        <IconShield className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold tracking-tight text-white">ProvaSegura</p>
                        <p className="text-[11px] uppercase tracking-widest text-brand-300/70">Admin</p>
                    </div>
                </div>

                <nav className="mt-2 flex-1 space-y-1 px-3">
                    {nav.map((n) => {
                        const active = isActive(n.match, current);
                        return (
                            <Link
                                key={n.name}
                                href={route(n.href)}
                                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                                    active
                                        ? 'bg-white/[0.06] text-white'
                                        : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                                }`}
                            >
                                {active && (
                                    <motion.span
                                        layoutId="admin-active"
                                        className="absolute inset-y-1.5 left-0 w-1 rounded-full bg-brand-400"
                                    />
                                )}
                                <n.icon className="h-5 w-5" />
                                {n.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t border-white/10 p-3">
                    <div className="flex items-center gap-3 rounded-xl px-3 py-2">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-500/20 text-sm font-bold text-brand-200">
                            {auth.user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-white">{auth.user?.name}</p>
                            <p className="truncate text-xs text-slate-500">{auth.user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.post(route('logout'))}
                        className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-all hover:bg-red-500/10 hover:text-red-300"
                    >
                        <IconLogout className="h-5 w-5" />
                        Sair
                    </button>
                </div>
            </aside>

            {/* Mobile top bar */}
            <div className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-ink-900/80 px-4 py-3 backdrop-blur-xl lg:hidden">
                <div className="flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                        <IconShield className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-white">ProvaSegura</span>
                </div>
                <div className="flex items-center gap-1">
                    {nav.map((n) => (
                        <Link
                            key={n.name}
                            href={route(n.href)}
                            className={`rounded-lg p-2 ${isActive(n.match, current) ? 'bg-white/10 text-white' : 'text-slate-400'}`}
                        >
                            <n.icon className="h-5 w-5" />
                        </Link>
                    ))}
                    <button onClick={() => router.post(route('logout'))} className="rounded-lg p-2 text-slate-400">
                        <IconLogout className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <main className="min-w-0 flex-1">
                <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h1>
                        </div>
                        {actions && <div className="flex items-center gap-3">{actions}</div>}
                    </div>
                    {children}
                </div>
            </main>

            <Toast />
        </div>
    );
}
