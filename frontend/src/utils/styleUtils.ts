export const getVoteBadgeStyle = (vote: number) => {
    // Gradient from Red (low) to Yellow (mid) to Green (high)
    // Simple 3-stop logic or calculated HSL

    // Let's use HSL for smoothness.
    // Red = 0, Green = 120.
    // Map 1-10 to 0-120.
    const hue = ((vote - 1) / 9) * 120; // 1->0, 10->120

    // Use a linear gradient for visual flair
    // Background color is main, gradient adds depth
    return {
        background: `linear-gradient(135deg, hsl(${hue}, 80%, 40%), hsl(${hue}, 80%, 30%))`,
        color: '#fff',
        padding: '2px 8px',
        borderRadius: '0.375rem', // radius-sm
        fontSize: '0.875rem', // sm
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    };
};
