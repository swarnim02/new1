const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
    contestName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    startTime: {
        type: Date
    },
    endTime: {
        type: Date
    },
    mentorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    problems: [{
        order: String,
        title: String,
        link: String,
        platform: String
    }],
    isGlobal: {
        type: Boolean,
        default: false
    },
    registeredStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Contest', contestSchema);
