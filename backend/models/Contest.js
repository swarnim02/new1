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
        order: String,
        link: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('Contest', contestSchema);
