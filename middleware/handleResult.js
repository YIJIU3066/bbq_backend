module.exports = (req, res, next) => {
    // console.log('[Middleware] handleResult');
    const result = res.locals.result;
    if (!result) {
        return next(new Error('Response result not found'));
    }

    if (result.status && result.status !== 200) {
        return res.status(result.status).json(result);
    }

    return res.status(200).json(result);
};
