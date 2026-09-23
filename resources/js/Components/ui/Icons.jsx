const base = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
};

const Svg = ({ children, className = 'w-5 h-5', size }) => (
    <svg
        viewBox="0 0 24 24"
        className={className}
        width={size}
        height={size}
        {...base}
        aria-hidden="true"
    >
        {children}
    </svg>
);

export const IconDashboard = (p) => (
    <Svg {...p}>
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </Svg>
);

export const IconUsers = (p) => (
    <Svg {...p}>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
        <path d="M16 5.2a3 3 0 0 1 0 5.6" />
        <path d="M17 20a5.5 5.5 0 0 0-2.5-4.6" />
    </Svg>
);

export const IconExam = (p) => (
    <Svg {...p}>
        <path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
        <path d="M14 3v5h5" />
        <path d="M9 13l1.5 1.5L13 12" />
        <path d="M9 17h6" />
    </Svg>
);

export const IconClock = (p) => (
    <Svg {...p}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
    </Svg>
);

export const IconCheck = (p) => (
    <Svg {...p}>
        <path d="M20 6 9 17l-5-5" />
    </Svg>
);

export const IconPlus = (p) => (
    <Svg {...p}>
        <path d="M12 5v14M5 12h14" />
    </Svg>
);

export const IconTrash = (p) => (
    <Svg {...p}>
        <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
    </Svg>
);

export const IconLogout = (p) => (
    <Svg {...p}>
        <path d="M15 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3" />
        <path d="M10 12H3m0 0 3-3m-3 3 3 3" />
    </Svg>
);

export const IconShield = (p) => (
    <Svg {...p}>
        <path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3Z" />
        <path d="M9 12l2 2 4-4" />
    </Svg>
);

export const IconKey = (p) => (
    <Svg {...p}>
        <circle cx="8" cy="8" r="4" />
        <path d="M11 11l8 8M16 16l2-2M19 19l2-2" />
    </Svg>
);

export const IconCopy = (p) => (
    <Svg {...p}>
        <rect x="9" y="9" width="11" height="11" rx="2" />
        <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </Svg>
);

export const IconAlert = (p) => (
    <Svg {...p}>
        <path d="M12 3 2 20h20L12 3Z" />
        <path d="M12 9v5M12 17.5h.01" />
    </Svg>
);

export const IconArrow = (p) => (
    <Svg {...p}>
        <path d="M5 12h14m0 0-6-6m6 6-6 6" />
    </Svg>
);

export const IconEdit = (p) => (
    <Svg {...p}>
        <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
        <path d="M13.5 6.5l3 3" />
    </Svg>
);

export const IconChart = (p) => (
    <Svg {...p}>
        <path d="M4 20V4M4 20h16" />
        <path d="M8 16v-4M12 16V8M16 16v-6" />
    </Svg>
);

export const IconEye = (p) => (
    <Svg {...p}>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
    </Svg>
);
