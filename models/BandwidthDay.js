const mongoose = require('mongoose');

function transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
}

const bandwidthDaySchema = mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true
    },
    bandwidth: [
        [Number]
    ]
}, {
    timestamps: true,
    toObject: { transform },
    toJSON: { transform }
});

module.exports = mongoose.model('BandwidthDay', bandwidthDaySchema);