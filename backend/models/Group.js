const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    groupName: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    mentorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    contests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contest'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);
