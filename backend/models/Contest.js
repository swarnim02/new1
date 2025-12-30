const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
    contestName: {
        type: String,
        required: true,
        trim: true
    },
    mentorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    problems: [{
        order: { type: String, required: true }, // A, B, C, D...
        link: { type: String, required: true }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Contest', contestSchema);
