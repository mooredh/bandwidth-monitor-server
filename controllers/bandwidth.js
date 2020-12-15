const BandwidthDay = require("../models/BandwidthDay");
const { getPastMonth, dateMMMDD } = require("../utils/helpers");

async function getBandwidthOverview(req, res, next) {
    try {
        const today = new Date();
        const currentHour = today.getHours();
        const lastMonth = getPastMonth(today);
        const dateRange = `${dateMMMDD(lastMonth)} - ${dateMMMDD(today)}`;
        let bandwidthDays = await BandwidthDay.find({ date: { $gte: lastMonth.toDateString(), $lte: today.toDateString() } });
        let monthlyStats = [0, 0];
        let hourlyStats = [0, 0];
        for (const bandwidth of bandwidthDays) {
            for (const bwhour of bandwidth.bandwidth) {
                monthlyStats[0] += bwhour[0];
                monthlyStats[1] += bwhour[1];
            }

            if (bandwidth.date.toDateString() === today.toDateString()) {
                hourlyStats[0] += bandwidth.bandwidth[currentHour][0];
                hourlyStats[1] += bandwidth.bandwidth[currentHour][1];
            }
        }


        res.status(200).json({
            message: 'Successfully retrieved overview',
            data: {
                dateRange,
                monthlyStats,
                hourlyStats
            },
        });

        next()
    } catch (error) {
        res.status(500).json({
            message: error
        });
    }
};

async function getBandwidthByMonth(req, res, next) {
    try {
        let { month, year } = req.query;
        month = parseInt(month);
        year = parseInt(year);
        const error = await validateMonth(month, year);
        if (error !== '') {
            res.status(400).json({
                msg: error
            });
            return;
        }
        let from = new Date(year, month);
        let to = new Date(year, month >= 11 ? 0 : month+1 , 0);
        let bandwidthDays = await BandwidthDay.find({ date: { $gte: from.toDateString(), $lte: to.toDateString() } });
        let data = {};

        for (let i = 1; i <= to.getDate(); i++) {
            data[i] = [0, 0];
        }

        bandwidthDays.forEach(bw => {
            let tmp = [0, 0];
            bw.bandwidth.forEach(bwArr => {
                tmp[0] += bwArr[0];
                tmp[1] += bwArr[1];
            });
            data[bw.date.getDate()] = [...tmp];
        });

        res.status(200).json({
            message: 'Successfully retrieved bandwidth',
            data
        });

        next()
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error
        });
    }
};

async function addBandwidth(req, res, next) {
    try {
        let { bandwidth } = req.body;
        const error = await validateBandwidth(bandwidth);
        if (error !== '') {
            res.status(400).json({
                msg: error
            });
            return;
        }

        for (let key in bandwidth) {
            await addBandwidthByDate(key, bandwidth[key]);
        }

        res.status(200).json({
            message: 'Successfully added bandwidth'
        });

        next();
    } catch (error) {
        res.status(500).json({
            message: error
        });
    }
};

async function addBandwidthByDate(date, bandwidth) {
    date = new Date(Date.parse(date));

    let bandwidthDay = await BandwidthDay.findOne({
        date
    });

    let bandwidthDayArr

    if (!bandwidthDay) {
        bandwidthDayArr = Array.from({length: 24}, e => Array(2).fill(0));
    } else {
        bandwidthDayArr = [...bandwidthDay.bandwidth];
    }

    for (let i = 0; i < 24; i++) {
        if (bandwidthDayArr[i][0] < bandwidth[i][0]) bandwidthDayArr[i] = bandwidth[i];
    }

    if (bandwidthDay) {
        await bandwidthDay.update({
            bandwidth: bandwidthDayArr
        });

        return;
    }

    bandwidthDay = new BandwidthDay({
        date,
        bandwidth: bandwidthDayArr,
    });

    await bandwidthDay.save();

    return;
}

async function validateBandwidth(bandwidth) {
    if (typeof bandwidth !== 'object') return 'Bandwidth is not an Object';
    for (let key in bandwidth) {
        if (!Date.parse(key)) return 'All bandwidth keys must be dates';
        if (bandwidth[key].length !== 24) return 'All bandwidth values must be array of length 24';
        for (let j = 0; j < 24; j++) {
            if (typeof bandwidth[key][j][0] !== 'number') return 'All rx values must be numbers';
            if (typeof bandwidth[key][j][1] !== 'number') return 'All tx values must be numbers';
        }
    }

    return '';
}

async function validateMonth(month, year) {
    if (isNaN(month) || isNaN(year)) return 'Month and year must be numbers'
    if (month < 0 || month > 11) return 'Month not between 0 and 11';
    if (year < 2020 || year > 2040) return 'Year not in correct range';

    return '';
}

module.exports = {
    addBandwidth,
    getBandwidthOverview,
    getBandwidthByMonth,
};