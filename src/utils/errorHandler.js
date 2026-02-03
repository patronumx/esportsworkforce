export const formatError = (error) => {
    if (!error) return 'An unexpected error occurred.';

    // Network Errors
    if (error.code === 'ERR_NETWORK') {
        return 'Unable to connect to the server. Please check your internet connection.';
    }

    // Backend Response Errors
    if (error.response) {
        //If the backend sends a specific message, use it, but filter out "localhost" or technical jargon if needed
        const message = error.response.data?.message || error.response.statusText;

        if (message && (message.includes('localhost') || message.includes('ECONNREFUSED'))) {
            return 'Server is currently unavailable. Please try again later.';
        }

        return message || 'Something went wrong. Please try again.';
    }

    // Default
    return error.message || 'An unexpected error occurred.';
};
