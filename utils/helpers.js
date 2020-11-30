function getPastMonth(date) {
    const d = new Date(date);
    const m = d.getMonth();
    d.setMonth(d.getMonth() - 1);

    if (d.getMonth() === m) d.setDate(0);

    d.setHours(0, 0, 0);
    d.setMilliseconds(0);

    return d;
}

function dateMMMDD(date) {
    return date.toString().substring(4, 10);
}

module.exports = { getPastMonth, dateMMMDD }