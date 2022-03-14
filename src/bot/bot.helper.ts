export const getPriorDate = (today: Date, daysAgo: number) => {
    return new Date(new Date().setDate(today.getDate() - daysAgo ))
}