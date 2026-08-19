import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

const { sendMock } = vi.hoisted(() => ({
  sendMock: vi.fn(),
}));

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: class {
    send = sendMock;
  },

  PutObjectCommand: vi.fn(function (params) {
    Object.assign(this, params);
  }),
}));

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { updateToS3 } from "../../../AWS/s3.js";

describe("updateToS3", () => {
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it("should upload data to S3 successfully", async () => {
    sendMock.mockResolvedValue({});

    await updateToS3("test.json", "hello world");

    expect(sendMock).toHaveBeenCalledTimes(1);

    expect(PutObjectCommand).toHaveBeenCalledWith({
      Bucket: "cat-notes",
      Key: expect.stringMatching(/^\d{2}_\d{2}_\d{2}\/test\.json$/),
      Body: "hello world",
    });
  });

  it("should use the provided filename", async () => {
    sendMock.mockResolvedValue({});

    await updateToS3("my-file.json", "some data");

    expect(PutObjectCommand).toHaveBeenCalledWith({
      Bucket: "cat-notes",
      Key: expect.stringMatching(/^\d{2}_\d{2}_\d{2}\/my-file\.json$/),
      Body: "some data",
    });
  });

  it("should use the provided data as Body", async () => {
    sendMock.mockResolvedValue({});

    const data = JSON.stringify({
      name: "Cat",
      age: 3,
    });

    await updateToS3("cat.json", data);

    expect(PutObjectCommand).toHaveBeenCalledWith({
      Bucket: "cat-notes",
      Key: expect.any(String),
      Body: data,
    });
  });

  it("should throw when S3 upload fails", async () => {
    sendMock.mockRejectedValue(new Error("S3 upload failed"));

    await expect(updateToS3("test.json", "hello")).rejects.toThrow(
      "S3 upload failed",
    );
  });
});
