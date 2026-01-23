import React from 'react';

export const getVoteBadgeStyle = (vote: number) => {
    // Gradient from Red (low) to Yellow (mid) to Green (high)
    // Red = 0, Green = 120.
    const hue = ((vote - 1) / 9) * 120; // 1->0, 10->120

    return {
        className: "inline-flex items-center justify-center px-2 py-0.5 rounded-md text-sm font-semibold text-white shadow-sm min-w-[2.5em]",
        style: {
            background: `linear-gradient(135deg, hsl(${hue}, 80%, 40%), hsl(${hue}, 80%, 30%))`
        } as React.CSSProperties
    };
};
