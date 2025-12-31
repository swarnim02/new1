const { getAllProblems, getUserRatingHistory } = require('./utils/codeforcesAPI');

async function test() {
    console.log('--- Testing CF API ---');
    
    console.log('1. Fetching Rating History for tourist...');
    const history = await getUserRatingHistory('tourist');
    console.log(`History length: ${history.length}`);
    if (history.length > 0) console.log('Sample:', history[0]);

    console.log('2. Fetching All Problems...');
    const probs = await getAllProblems();
    console.log(`Problems length: ${probs.length}`);
    if (probs.length > 0) console.log('Sample:', probs[0]);

    // Check type of contestId
    if (probs.length > 0) {
        console.log('ContestId type:', typeof probs[0].contestId);
    }
}

test();
