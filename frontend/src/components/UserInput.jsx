import React, { useState } from 'react';

const UserInput = ({ onSubmit, loading }) => {
    const [handle, setHandle] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmedHandle = handle.trim();
        if (trimmedHandle) {
            onSubmit(trimmedHandle);
        }
    };

    return (
        <div style={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            marginBottom: '2rem',
            backdropFilter: 'blur(10px)'
        }}>
            <h3 style={{ color: 'white', marginBottom: '1rem' }}>Enter Codeforces Handle</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                    <input 
                        type="text"
                        value={handle}
                        onChange={(e) => setHandle(e.target.value)}
                        placeholder="Enter Codeforces username"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '1rem',
                            backdropFilter: 'blur(5px)'
                        }}
                    />
                </div>
                <button 
                    type="submit"
                    disabled={!handle.trim() || loading}
                    style={{
                        background: 'white',
                        color: '#000',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: handle.trim() && !loading ? 'pointer' : 'not-allowed',
                        opacity: handle.trim() && !loading ? 1 : 0.6,
                        transition: 'all 0.3s ease'
                    }}
                >
                    {loading ? 'Loading...' : 'Get Stats'}
                </button>
            </form>
        </div>
    );
};

export default UserInput;