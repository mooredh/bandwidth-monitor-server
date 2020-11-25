const BandwidthDay = require("../models/BandwidthDay");

async function getBandwidth(req, res, next) {
    try {
        bandwidthDays = await BandwidthDay.find();

        res.status(200).json({
            message: 'Successfully retrieved bandwidth days',
            bandwidthDays
        });

        next()
    } catch (error) {
        res.status(500).json({
            message: error
        });
    }
};

async function addBandwidth(req, res, next) {
    try {
        let { bandwidth } = req.body;
        const error = await validate(bandwidth);
        if (error !== '') res.status(400).json({
            msg: error
        });

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

async function validate(bandwidth) {
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

module.exports = {
    getBandwidth,
    addBandwidth
};