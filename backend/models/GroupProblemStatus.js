const mongoose = require('mongoose');

const groupProblemStatusSchema = new mongoose.Schema({
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GroupProblem',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Solved'],
        default: 'Pending'
    },
    timeTaken: {
        type: String,
        enum: ['<20min', '<30min', '<1hour', '<3hour']
    },
    learnings: {
        type: String,
        trim: true,
        maxlength: 500 // Word/character limit
    },
    solvedAt: {
        type: Date
    }
}, { timestamps: true });

// Ensure uniqueness per user per problem in a group
groupProblemStatusSchema.index({ userId: 1, problemId: 1, groupId: 1 }, { unique: true });

module.exports = mongoose.model('GroupProblemStatus', groupProblemStatusSchema);
