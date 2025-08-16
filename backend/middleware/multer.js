import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadImage = upload.single("image");

export default uploadImage;
