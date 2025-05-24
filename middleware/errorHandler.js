module.exports = (err, req, res, next) => {
    console.error('[Error]', err.stack || err.message);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message || 'An unexpected error occurred.'
    });
};
