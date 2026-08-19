import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('../../../AWS/s3.js', () => ({
  updateToS3: vi.fn(),
}));

vi.mock('../../../mails/mailtrap.js', () => ({
  getMailCount: vi.fn(),
}));

vi.mock('../../../models/note_model.js', () => ({
  default: {
    countDocuments: vi.fn(),
    find: vi.fn(),
  },
}));

vi.mock('../../../models/user_model.js', () => ({
  default: {
    countDocuments: vi.fn(),
    find: vi.fn(),
  },
}));

import { updateToS3 } from '../../../AWS/s3.js';
import { getMailCount } from '../../../mails/mailtrap.js';
import Note from '../../../models/note_model.js';
import User from '../../../models/user_model.js';
import {
  analytics,
  exportdb,
} from '../../../controllers/analytics_controller.js';

describe('analytics_controller', () => {
  let req;
  let res;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      query: {},
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      send: vi.fn(),
    };

    process.env.ANALYTICS_TOKEN = 'test-token';
  });

  describe('analytics', () => {
    test('should return success without analytics data when token is invalid', async () => {
      req.query.token = 'wrong-token';

      await analytics(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
      });

      expect(User.countDocuments).not.toHaveBeenCalled();
      expect(Note.countDocuments).not.toHaveBeenCalled();
      expect(getMailCount).not.toHaveBeenCalled();
    });

    test('should return analytics data when token is valid', async () => {
      req.query.token = 'test-token';

      User.countDocuments.mockResolvedValue(10);
      Note.countDocuments.mockResolvedValue(25);
      getMailCount.mockReturnValue(100);

      await analytics(req, res);

      expect(User.countDocuments).toHaveBeenCalledTimes(1);
      expect(Note.countDocuments).toHaveBeenCalledTimes(1);
      expect(getMailCount).toHaveBeenCalledTimes(1);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        users: 10,
        notes: 25,
        mails: 100,
      });
    });

    test('should return 500 when an error occurs', async () => {
      req.query.token = 'test-token';

      User.countDocuments.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await analytics(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Server internal error',
      });
    });
  });

  describe('exportdb', () => {
    test('should export notes and users to S3', async () => {
      const notes = [
        {
          _id: 'note1',
          title: 'Note 1',
          content: 'Hello',
        },
        {
          _id: 'note2',
          title: 'Note 2',
          content: 'World',
        },
      ];

      const users = [
        {
          _id: 'user1',
          username: 'user1',
        },
        {
          _id: 'user2',
          username: 'user2',
        },
      ];

      Note.find.mockReturnValue({
        lean: vi.fn().mockResolvedValue(notes),
      });

      User.find.mockReturnValue({
        lean: vi.fn().mockResolvedValue(users),
      });

      await exportdb(req, res);

      expect(Note.find).toHaveBeenCalledTimes(1);
      expect(User.find).toHaveBeenCalledTimes(1);

      expect(updateToS3).toHaveBeenCalledTimes(2);

      expect(updateToS3).toHaveBeenNthCalledWith(
        1,
        'notes.json',
        JSON.stringify(notes, null, 2),
      );

      expect(updateToS3).toHaveBeenNthCalledWith(
        2,
        'users.json',
        JSON.stringify(users, null, 2),
      );
    });

    test('should stop exporting when fetching notes fails', async () => {
      Note.find.mockReturnValue({
        lean: vi.fn().mockRejectedValue(
          new Error('Failed to fetch notes'),
        ),
      });

      await exportdb(req, res);

      expect(Note.find).toHaveBeenCalledTimes(1);
      expect(User.find).not.toHaveBeenCalled();
      expect(updateToS3).not.toHaveBeenCalled();
    });

    test('should export notes but not users when fetching users fails', async () => {
      const notes = [
        {
          _id: 'note1',
          title: 'Note 1',
          content: 'Hello',
        },
      ];

      Note.find.mockReturnValue({
        lean: vi.fn().mockResolvedValue(notes),
      });

      User.find.mockReturnValue({
        lean: vi.fn().mockRejectedValue(
          new Error('Failed to fetch users'),
        ),
      });

      await exportdb(req, res);

      expect(Note.find).toHaveBeenCalledTimes(1);
      expect(User.find).toHaveBeenCalledTimes(1);

      expect(updateToS3).toHaveBeenCalledTimes(1);

      expect(updateToS3).toHaveBeenCalledWith(
        'notes.json',
        JSON.stringify(notes, null, 2),
      );
    });
  });
});