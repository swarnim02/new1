const mongoose = require('mongoose');

const problemStatusSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    contestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contest',
        required: true
    },
    problemIndex: {
        type: String, // A, B, C...
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted'],
        default: 'Pending'
    },
    solvedAt: {
        type: Date
    }
}, { timestamps: true });

// Compound index to ensure uniqueness of tracking per user per problem in a contest
problemStatusSchema.index({ userId: 1, contestId: 1, problemIndex: 1 }, { unique: true });

module.exports = mongoose.model('ProblemStatus', problemStatusSchema);
