export function getStreakUpdate(lastActivityDate, currentStreak) {
    if (!lastActivityDate) return { streak: 1, shouldUpdate: true };
    
    const last = new Date(lastActivityDate + 'T00:00:00');
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate());
    
    const diffTime = today - lastDay;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return { streak: currentStreak, shouldUpdate: false };
    } else if (diffDays === 1) {
        return { streak: currentStreak + 1, shouldUpdate: true };
    } else {
        return { streak: 1, shouldUpdate: true };
    }
}
