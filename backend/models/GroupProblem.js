const mongoose = require('mongoose');

const groupProblemSchema = new mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    mentorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    platform: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('GroupProblem', groupProblemSchema);
