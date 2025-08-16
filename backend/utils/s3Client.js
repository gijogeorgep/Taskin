import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import sharp from "sharp";

dotenv.config();

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const uploadFileToS3 = async (file, profileImageKey) => {
  try {
    // const profileImageKey = `uploads/${Date.now()}_${file.originalname}`;

    const buffer = await sharp(file.buffer)
      .resize({ height: 1920, width: 1080, fit: "contain" })
      .toBuffer();
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: profileImageKey,
      Body: buffer,
      ContentType: file.mimetype,
    });
    console.log("Sending upload command to S3...");
    const response = await s3.send(command);
    console.log("S3 upload successful:", response);

    const url = `https://${bucketName}.s3.amazonaws.com/${profileImageKey}`;
    return url;
  } catch (error) {
    console.log(error);
  }
};

export default uploadFileToS3;
export { s3 };
