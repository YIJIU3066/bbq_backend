module.exports = (req, res, next) => {
    // console.log('[Middleware] handleResult');
    const result = res.locals.result;
    if (!result) {
        return res.status(404).json({
            error: 'Not Found',
            message: result?.error || 'Requested resource not found'
        });
    }

    if (result.status && result.status !== 200) {
        return res.status(result.status).json(result);
    }

    return res.status(200).json(result);
};
