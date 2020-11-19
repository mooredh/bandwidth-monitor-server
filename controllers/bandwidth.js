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
        let {
            date,
            hour,
            bandwidth
        } = req.body;
        const error = validate(date, hour, bandwidth);
        if (error !== '') res.status(400).json({
            msg: error
        });
        date = new Date(Date.parse(date));

        let bandwidthDay = await BandwidthDay.findOne({
            date
        });
        console.log(bandwidthDay);

        let bandwidthDayArr

        if (!bandwidthDay) {
            bandwidthDayArr = new Array(24).fill([0, 0]);
        } else {
            bandwidthDayArr = [...bandwidthDay.bandwidth];
        }
        bandwidthDayArr[hour] = [...bandwidth];

        if (bandwidthDay) {
            await bandwidthDay.update({
                bandwidth: bandwidthDayArr
            });

            res.status(200).json({
                message: 'Successfully added bandwidth'
            });

            next();
        }

        bandwidthDay = new BandwidthDay({
            date,
            bandwidth: bandwidthDayArr,
        });

        await bandwidthDay.save();

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

function validate(date, hour, bandwidth) {
    if (!Date.parse(date)) return 'Date is not proper Date';
    if (typeof hour !== 'number') return 'Hour is not Number type';
    if (hour < 0 || hour > 23) return 'Hour is not between 0 and 23';
    if (!(bandwidth instanceof Array)) return 'Bandwidth is not an Array';
    if (bandwidth.length !== 2) return 'Bandwidth\'s length is not two';
    if (bandwidth.some(i => (typeof i) !== 'number')) return 'Bandwidth contains non-number';

    return '';
}

module.exports = {
    getBandwidth,
    addBandwidth
};