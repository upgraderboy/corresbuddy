import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const region = process.env.AWS_REGION || 'us-east-1';
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const bucketName = process.env.AWS_S3_BUCKET;

const isS3Configured = Boolean(accessKeyId && secretAccessKey && bucketName);

let s3Client = null;
if (isS3Configured) {
  s3Client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

// Local fallback directory when S3 is not configured
const localUploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(localUploadsDir)) {
  fs.mkdirSync(localUploadsDir, { recursive: true });
}

export const uploadFileToS3 = async (fileBuffer, key, mimeType) => {
  if (isS3Configured && s3Client) {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
    });
    await s3Client.send(command);
    return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
  } else {
    // Local storage fallback
    const filePath = path.join(localUploadsDir, key);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    await fs.promises.writeFile(filePath, fileBuffer);
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    return `${baseUrl}/uploads/${key}`;
  }
};

export const getDownloadUrl = async (key) => {
  if (isS3Configured && s3Client) {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    // Generate 1-hour presigned URL
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  } else {
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    return `${baseUrl}/uploads/${key}`;
  }
};

export default {
  uploadFileToS3,
  getDownloadUrl,
  isS3Configured,
  bucketName,
};

