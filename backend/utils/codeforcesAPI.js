const axios = require('axios');

/**
 * Codeforces API Utility
 * Official API: https://codeforces.com/apiHelp
 */

const CF_API_BASE = 'https://codeforces.com/api';

/**
 * Fetch problem information from Codeforces
 * @param {string} contestId - Contest ID (e.g., "1234")
 * @param {string} problemIndex - Problem index (e.g., "A", "B")
 * @returns {Promise<Object>} Problem details
 */
async function getProblemInfo(contestId, problemIndex) {
    try {
        const response = await axios.get(`${CF_API_BASE}/problemset.problems`);
        
        if (response.data.status === 'OK') {
            const problems = response.data.result.problems;
            const problem = problems.find(
                p => p.contestId === parseInt(contestId) && p.index === problemIndex
            );
            
            if (problem) {
                return {
                    success: true,
                    data: {
                        contestId: problem.contestId,
                        index: problem.index,
                        name: problem.name,
                        type: problem.type,
                        rating: problem.rating || 'Unrated',
                        tags: problem.tags || []
                    }
                };
            } else {
                return {
                    success: false,
                    error: 'Problem not found'
                };
            }
        }
    } catch (error) {
        console.error('Codeforces API Error:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Parse Codeforces problem link
 * @param {string} link - Full Codeforces problem URL
 * @returns {Object} Parsed contest ID and problem index
 * 
 * Example: https://codeforces.com/problemset/problem/1234/A
 * Returns: { contestId: "1234", problemIndex: "A" }
 */
function parseProblemLink(link) {
    const regex = /codeforces\.com\/problemset\/problem\/(\d+)\/([A-Z]\d?)/i;
    const match = link.match(regex);
    
    if (match) {
        return {
            contestId: match[1],
            problemIndex: match[2].toUpperCase()
        };
    }
    
    return null;
}

/**
 * Validate if a Codeforces problem link is valid
 * @param {string} link - Codeforces problem URL
 * @returns {Promise<boolean>} True if valid
 */
async function validateProblemLink(link) {
    const parsed = parseProblemLink(link);
    if (!parsed) return false;
    
    const info = await getProblemInfo(parsed.contestId, parsed.problemIndex);
    return info.success;
}

module.exports = {
    getProblemInfo,
    parseProblemLink,
    validateProblemLink
};
