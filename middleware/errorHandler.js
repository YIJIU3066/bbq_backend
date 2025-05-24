module.exports = (err, req, res, next) => {
    console.error('[Error]', err.stack || err.message);

    res.status(err.status || 500).json({
        error: err.status ? 'Client Error' : 'Internal Server Error',
        message: err.message || 'An unexpected error occurred.'
    });
};
