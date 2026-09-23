import { IconLogout, IconShield } from '@/Components/ui/Icons';
import Toast from '@/Components/ui/Toast';
import { Link, router, usePage } from '@inertiajs/react';

export default function StudentLayout({ title, children }) {
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen">
            <header className="sticky top-0 z-30 border-b border-white/10 bg-ink-900/70 backdrop-blur-xl">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5 sm:px-8">
                    <Link href={route('student.dashboard')} className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow">
                            <IconShield className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold tracking-tight text-white">ProvaSegura</p>
                            <p className="text-[11px] uppercase tracking-widest text-brand-300/70">Área do Aluno</p>
                        </div>
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="hidden items-center gap-3 sm:flex">
                            <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-500/20 text-sm font-bold text-brand-200">
                                {auth.user?.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-slate-300">{auth.user?.name}</span>
                        </div>
                        <button
                            onClick={() => router.post(route('logout'))}
                            className="btn-ghost"
                            title="Sair"
                        >
                            <IconLogout className="h-4 w-4" />
                            <span className="hidden sm:inline">Sair</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
                {title && (
                    <h1 className="mb-8 text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h1>
                )}
                {children}
            </main>

            <Toast />
        </div>
    );
}
