
import { generateId} from '../utils/helpers.js';

import multer from 'multer';
import color from 'picocolors';

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const filename = `${generateId()}-${file.originalname.toLowerCase().replace(' ', '-')}`;

        console.log(`Unique filename: ${color.green(filename)}`);

        cb(null, filename);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    if( allowedTypes.includes(file.mimetype) ){
        cb(null, true);
    }else{
        cb(new Error('Invalid file type. Only JPG, JPEG and PNG are allowed.'), false);
    }
};

const upload = multer({ storage, fileFilter });

export { upload };