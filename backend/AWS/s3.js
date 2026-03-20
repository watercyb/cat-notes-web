import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const updateToS3 = async (filename, data) => {
  const now = new Date();
  let dateUTC8 = now.toLocaleDateString("en-US", {
    timeZone: "Etc/GMT+8",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  });
  dateUTC8 = dateUTC8.replace(/\//g, "_");

  await s3.send(
    new PutObjectCommand({
      Bucket: "cat-notes",
      Key: dateUTC8 + "/" + filename,
      Body: data,
    }),
  );
};
