const mongoose = require('mongoose');

const problemSetSchema = new mongoose.Schema({
    setName: {
        type: String,
        required: true,
        trim: true
    },
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
    problems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GroupProblem'
    }]
}, { timestamps: true });

module.exports = mongoose.model('ProblemSet', problemSetSchema);
