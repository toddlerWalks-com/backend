const Hospital = require("../../schemas/Hospital");
const {uploadFile} = require("../Firebase/imageUpload.service");
const getDistance = require('../../../private/helpers/get_distance');

// upload hospital images
async function uploadHospitalImages({hospital_id, files}) {
    try {
        let images = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            const imageUrl = await uploadFile(file, "images");

            images.push(imageUrl);
        }

        const result = await Hospital.updateOne({_id: hospital_id}, {$push: {images: {$each: images}}});

        if (result != null) {
            return {message: "Images uploaded successfully"};
        }
        return {message: "Images not uploaded. Try again"};
    } catch (error) {
        return {message: "An error occurred. Please try again."};
    }
}

// search nearby hospital
// uses search text to query the db
// uses the user's current location to make the distance
// to the hospital is less than 50km
async function searchNearbyHospital({search_text, user_latitude, user_longitude}) {
    try {
        const hospitals = await Hospital.find({
            "$or": [
                {name: {$regex: search_text, "$options": "i"}},
                {address: {$regex: search_text, "$options": "i"}},
            ]
        });
        if (!hospitals) {
            return {message: "no hospital found", data: []}
        }

        let results = [];

        hospitals.forEach(hospital => {
            const distance = getDistance({lat1: user_latitude, lng1: user_longitude,
                lat2: hospital.gps_lat, lng2: hospital.gps_lng })

            if (distance < 50.0) {
                results.push(hospital);
            }
        });
        return { message: "success", data: results };
    } catch (error) {
        return {message: "An error occurred. Please try again."};
    }
}


module.exports = {
    uploadHospitalImages,
    searchNearbyHospital,
}