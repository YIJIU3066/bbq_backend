const axios = require('axios');

const { updateUser } = require('../models/user');

// 用於下載頭像
const downloadImage = async (url) => {
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'arraybuffer'
    });

    return response.data;
};

// 將圖片存進 DB
const saveProfilePicture = async (userId, imageUrl) => {
    try {
        const imageData = await downloadImage(imageUrl);
        await updateUser({
            uId: userId,
            avatar: imageData
        });
        console.log('Profile picture saved successfully!');
    } catch (error) {
        console.error(
            'Error saving profile picture:',
            error
        );
    }
};

module.exports = { downloadImage, saveProfilePicture };
